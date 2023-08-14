const { pool } = require('./dbConfig.js');

const Bin = require('../models/bin.js');
const Location = require('../models/location.js');
const Stream = require('../models/stream.js');
const User = require('../models/user.js');

const createUser = async (req, res) => {
    try {
        const { name, email, locations } = req.body;
        const userQueryText = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id';
        const userResult = await pool.query(userQueryText, [name, email]);
        const userId = userResult.rows[0].id;

        if (locations != undefined) {
            for (const location of locations) {
                const { address, locationPoint, streams } = location;

                const locationQueryText = 'INSERT INTO locations (user_id, address, location) VALUES ($1, $2, point($3, $4)) RETURNING id';
                const locationResult = await pool.query(locationQueryText, [userId, address, locationPoint.x, locationPoint.y]);
                const locationId = locationResult.rows[0].id;

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
            }
        }
        res.status(200).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const userQuery = 'SELECT * FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        if (userResult.rowCount === 0) { return res.status(404).send('User not found'); }
        const user = userResult.rows[0];
        const locationsQuery = 'SELECT * FROM locations WHERE user_id = $1';
        const locationsResult = await pool.query(locationsQuery, [userId]);
        const locations = locationsResult.rows;
        user.locations = [];
        for (const location of locations) {
            const streamsQuery = 'SELECT * FROM streams WHERE location_id = $1';
            const streamsResult = await pool.query(streamsQuery, [location.id]);
            const streams = streamsResult.rows;
            location.streams = [];
            for (const stream of streams) {
                const binsQuery = 'SELECT * FROM bins WHERE stream_id = $1';
                const binsResult = await pool.query(binsQuery, [stream.id]);
                const bins = binsResult.rows;
                stream.bins = bins;
            }
            location.streams = streams;
            user.locations.push(location);
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send(error);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const usersQuery = 'SELECT * FROM users';
        const usersResult = await pool.query(usersQuery);
        const usersData = usersResult.rows;
        const users = await Promise.all(usersData.map(async userData => {
            const userId = userData.id;
            const locationsQuery = 'SELECT * FROM locations WHERE user_id = $1';
            const locationsResult = await pool.query(locationsQuery, [userId]);
            const locationData = locationsResult.rows;
            const locations = await Promise.all(locationData.map(async location => {
                const locationId = location.id;
                const streamsQuery = 'SELECT * FROM streams WHERE location_id = $1';
                const streamsResult = await pool.query(streamsQuery, [locationId]);
                const streamData = streamsResult.rows;
                const streams = await Promise.all(streamData.map(async stream => {
                    const streamId = stream.id;
                    const binsQuery = 'SELECT * FROM bins WHERE stream_id = $1';
                    const binsResult = await pool.query(binsQuery, [streamId]);
                    const binData = binsResult.rows;
                    const bins = binData.map(bin => new Bin(bin.id, bin.volume, bin.type));

                    return new Stream(streamId, stream.type, bins);
                }));

                return new Location(locationId, location.address, location.location, streams);
            }));

            return new User(userId, userData.name, userData.email, locations);
        }));

        res.json(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('Deleting user with ID:', userId);

        const deleteUserQuery = 'DELETE FROM users WHERE id = $1';
        const result = await pool.query(deleteUserQuery, [userId]);
        console.log('Delete result:', result);

        res.status(200).send('User and connected data deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email } = req.body;

        const updateUserQuery = 'UPDATE users SET name = $1, email = $2 WHERE id = $3';
        const result = await pool.query(updateUserQuery, [name, email, userId]);

        if (result.rowCount === 0) {
            res.status(404).send('User not found');
        } else {
            res.status(200).send('User updated successfully');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    deleteUser,
    updateUser,
}