const { pool } = require('./dbConfig.js');

const createMarker = async (req, res) => {
    try {
        console.log(req.body);
        const { lat, lng, address } = req.body;
        const binQueryText = 'INSERT INTO markers (location, address) VALUES (point($1, $2), $3)';
        await pool.query(binQueryText, [lat, lng, address]);
        res.status(201).send('Marker created successfully');
    } catch (error) {
        console.error('Error creating marker:', error);
        res.status(500).send('Error creating marker');
    }
}

const getMarkerById = async (req, res) => {
    try {
        const makerId = req.params.id;
        const markerQuery = 'SELECT * FROM markers WHERE id = $1';
        const markerResult = await pool.query(markerQuery, [makerId]);
        if (markerResult.rowCount === 0) { return res.status(404).send('Marker not found'); }
        const marker = markerResult.rows[0];
        res.json(marker);
    } catch (error) {
        console.error('Error fetching marker:', error);
        res.status(500).send(error);
    }
}

const getAllMarkers = async (req, res) => {
    try {
        const markersQuery = 'SELECT * FROM markers';
        const markersResult = await pool.query(markersQuery);
        const markersData = markersResult.rows;

        const markers = markersData.map(marker => ({
            lat: marker.location.x,
            lng: marker.location.y,
            address: marker.address
        }));

        res.json(markers);
    } catch (error) {
        console.error('Error fetching markers:', error);
        res.status(500).send(error);
    }
}

const hardlyDeleteMarker = async (req, res) => {
    try {
        const address = decodeURIComponent(req.params.address);
        console.log('Deleting marker with address:', address);

        const deleteMarkerQuery = 'DELETE FROM markers WHERE address = $1';
        const result = await pool.query(deleteMarkerQuery, [address]);
        console.log('Delete result:', result);

        res.status(204).send('Marker deleted successfully');
    } catch (error) {
        console.error('Error deleting marker:', error);
        res.status(500).send('Error deleting marker');
    }
}

module.exports = {
    createMarker,
    getMarkerById,
    getAllMarkers,
    hardlyDeleteMarker,
}