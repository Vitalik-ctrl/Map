const { pool } = require('./dbConfig.js');

const createLocation = async (req, res) => {
    try {
        const { user_id, address, locationPoint, streams } = req.body;
        console.log(user_id, address, locationPoint, streams);
        const locationQueryText = 'INSERT INTO locations (user_id, address, location) VALUES ($1, $2, point($3, $4)) RETURNING id';
        const locationResult = await pool.query(locationQueryText, [user_id, address, locationPoint.x, locationPoint.y]);
        const locationId = locationResult.rows[0].id;
        console.log(locationId);
        if (streams != undefined) {
            for (const stream of streams) {
                const { type, bins } = stream;

                const streamQueryText = 'INSERT INTO streams (location_id, type) VALUES ($1, $2) RETURNING id';
                const streamResult = await pool.query(streamQueryText, [locationId, type]);
                const streamId = streamResult.rows[0].id;

                if (bins != undefined) {
                    for (const bin of bins) {
                        const { volume, type: binType } = bin;
                        const binQueryText = 'INSERT INTO bins (stream_id, volume, type) VALUES ($1, $2, $3)';
                        await pool.query(binQueryText, [streamId, volume, binType]);
                    }
                }
            }
        }
        res.status(201).send('Location created successfully');
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).send('Error creating location');
    }
};

const getAllLocations = async (req, res) => {
    try {
        const locationsQuery = 'SELECT * FROM locations';
        const locationsResult = await pool.query(locationsQuery);
        const locationsData = locationsResult.rows;

        const locations = await Promise.all(locationsData.map(async locationData => {
            const locationId = locationData.id;

            const streamsQuery = 'SELECT * FROM streams WHERE location_id = $1';
            const streamsResult = await pool.query(streamsQuery, [locationId]);
            const streamData = streamsResult.rows;

            const streams = await Promise.all(streamData.map(async stream => {
                const streamId = stream.id;

                const binsQuery = 'SELECT * FROM bins WHERE stream_id = $1';
                const binsResult = await pool.query(binsQuery, [streamId]);
                const binData = binsResult.rows;

                const bins = binData.map(bin => ({
                    id: bin.id,
                    volume: bin.volume,
                    type: bin.type
                }));

                return {
                    id: streamId,
                    type: stream.type,
                    bins: bins
                };
            }));

            return {
                id: locationId,
                address: locationData.address,
                location: locationData.location,
                streams: streams
            };
        }));

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteLocation = async (req, res) => {
    try {
        const locationId = req.params.id;
        console.log('Deleting location with ID:', locationId);

        const deleteLocationQuery = 'DELETE FROM locations WHERE id = $1';
        const result = await pool.query(deleteLocationQuery, [locationId]);
        console.log('Delete result:', result);

        res.status(204).send('Location and connected data deleted successfully');
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).send('Error deleting location');
    }
};

const updateLocation = async (req, res) => {
    try {
        const locationId = req.params.id;
        const { address, locationPoint } = req.body;

        const updateLocationQuery = 'UPDATE locations SET address = $1, location = point($2, $3) WHERE id = $4';
        const result = await pool.query(updateLocationQuery, [address, locationPoint.x, locationPoint.y, locationId]);

        if (result.rowCount === 0) {
            res.status(404).send('Location not found');
        } else {
            res.status(201).send('Location updated successfully');
        }
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).send('Error updating location');
    }
};


module.exports = {
    getAllLocations,
    createLocation,
    deleteLocation,
    updateLocation,
}