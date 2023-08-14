const { pool } = require('./dbConfig.js');

const createBin = async (req, res) => {
    try {
        const { stream_id, volume, type } = req.body;
        const binQueryText = 'INSERT INTO bins (stream_id, volume, type) VALUES ($1, $2, $3)';
        await pool.query(binQueryText, [stream_id, volume, type]);
        res.status(201).send('Bin created successfully');
    } catch (error) {
        console.error('Error creating bin:', error);
        res.status(500).send('Error creating bin');
    }
}

const getAllBins = async (req, res) => {
    try {
        const binsQuery = 'SELECT * FROM bins';
        const binsResult = await pool.query(binsQuery);
        const binData = binsResult.rows;

        const bins = binData.map(bin => ({
            id: bin.id,
            volume: bin.volume,
            type: bin.type,
            streamId: bin.stream_id
        }));

        res.json(bins);
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteBin = async (req, res) => {
    try {
        const binId = req.params.id;
        console.log('Deleting bin with ID:', binId);

        const deleteBinQuery = 'DELETE FROM bins WHERE id = $1';
        const result = await pool.query(deleteBinQuery, [binId]);
        console.log('Delete result:', result);

        res.status(204).send('Bin deleted successfully');
    } catch (error) {
        console.error('Error deleting bin:', error);
        res.status(500).send('Error deleting bin');
    }
};

const updateBin = async (req, res) => {
    try {
        const binId = req.params.id;
        const { volume, type: binType } = req.body;

        const updateBinQuery = 'UPDATE bins SET volume = $1, type = $2 WHERE id = $3';
        const result = await pool.query(updateBinQuery, [volume, binType, binId]);

        if (result.rowCount === 0) {
            res.status(404).send('Bin not found');
        } else {
            res.status(201).send('Bin updated successfully');
        }
    } catch (error) {
        console.error('Error updating bin:', error);
        res.status(500).send('Error updating bin');
    }
};

module.exports = {
    getAllBins,
    createBin,
    deleteBin,
    updateBin,
}