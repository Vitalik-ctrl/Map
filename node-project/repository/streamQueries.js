const { pool } = require('./dbConfig.js');

const createStream = async (req, res) => {
    try {
        const { location_id, type, bins } = req.body;
        const streamQueryText = 'INSERT INTO streams (location_id, type) VALUES ($1, $2) RETURNING id';
        const streamResult = await pool.query(streamQueryText, [location_id, type]);
        const streamId = streamResult.rows[0].id;
        if (bins != undefined) {
            for (const bin of bins) {
                const { volume, type: binType } = bin;
                const binQueryText = 'INSERT INTO bins (stream_id, volume, type) VALUES ($1, $2, $3)';
                await pool.query(binQueryText, [streamId, volume, binType]);
            }
        }
        res.status(200).send('Stream created successfully');
    } catch (error) {
        console.error('Error creating stream:', error);
        res.status(500).send('Error creating stream');
    }
};

const getAllStreams = async (req, res) => {
    try {
        const streamsQuery = 'SELECT * FROM streams';
        const streamsResult = await pool.query(streamsQuery);
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

        res.json(streams);
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteStream = async (req, res) => {
    try {
        const streamId = req.params.id;
        console.log('Deleting stream with ID:', streamId);

        const deleteStreamQuery = 'DELETE FROM streams WHERE id = $1';
        const result = await pool.query(deleteStreamQuery, [streamId]);
        console.log('Delete result:', result);

        res.status(200).send('Stream and connected data deleted successfully');
    } catch (error) {
        console.error('Error deleting stream:', error);
        res.status(500).send('Error deleting stream');
    }
};

const updateStream = async (req, res) => {
    try {
        const streamId = req.params.id;
        const { type } = req.body;

        const updateStreamQuery = 'UPDATE streams SET type = $1 WHERE id = $2';
        const result = await pool.query(updateStreamQuery, [type, streamId]);

        if (result.rowCount === 0) {
            res.status(404).send('Stream not found');
        } else {
            res.status(200).send('Stream updated successfully');
        }
    } catch (error) {
        console.error('Error updating stream:', error);
        res.status(500).send('Error updating stream');
    }
};


module.exports = {
    getAllStreams,
    createStream,
    deleteStream,
    updateStream,
}