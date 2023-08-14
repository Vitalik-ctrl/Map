const express = require('express');
const cors = require('cors');
const markerDb = require('../repository/markerQueries.js');
const userDb = require('../repository/userQueries.js');
const locationDb = require('../repository/locationQueries.js');
const streamDb = require('../repository/streamQueries.js');
const binDb = require('../repository/binQueries.js');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/users', userDb.getAllUsers); // GET localhost:3001/users
app.get('/user/:id', userDb.getUserById); // GET localhost:3001/user/6
app.post('/users', userDb.createUser); // POST localhost:3001/users with body
app.delete('/users/:id', userDb.deleteUser); // DELETE localhost:3001/users/5
app.put('/users/:id', userDb.updateUser); // UPDATE localhost:3001/users/6 with body

app.get('/locations', locationDb.getAllLocations);
app.post('/locations', locationDb.createLocation);
app.delete('/locations/:id', locationDb.deleteLocation);
app.put('/locations/:id', locationDb.updateLocation);

app.get('/streams', streamDb.getAllStreams);
app.post('/streams', streamDb.createStream);
app.delete('/streams/:id', streamDb.deleteStream);
app.put('/streams/:id', streamDb.updateStream);

app.get('/bins', binDb.getAllBins);
app.post('/bins', binDb.createBin);
app.delete('/bins/:id', binDb.deleteBin);
app.put('/bins/:id', binDb.updateBin);

app.post('/markers', markerDb.createMarker); // POST localhost:3001/markers with body
app.get('/markers/:id', markerDb.getMarkerById); // GET localhost:3001/markers/6
app.get('/markers', markerDb.getAllMarkers); // GET localhost:3001/markers/
app.delete('/markers/:address', markerDb.hardlyDeleteMarker); // DELETE localhost:3001/markers/"address name"

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});