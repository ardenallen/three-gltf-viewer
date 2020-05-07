global.atob = require("atob");
const fs = require('fs');
var THREE = global.THREE = require('three');
require('three/examples/js/loaders/GLTFLoader.js');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('ready', () => {
        socket.emit('news', { hello: 'world' });
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

//         gltf.animations; // Array<THREE.AnimationClip>
//         gltf.scene; // THREE.Group
//         gltf.scenes; // Array<THREE.Group>
//         gltf.cameras; // Array<THREE.Camera>
//         gltf.asset; // Object
//
//     },

// Create a loader
const loader = new THREE.GLTFLoader();

// Read model from disk and parse it.
const content = fs.readFileSync( '../HumanSkeleton/SkeletalRig_v1_5_run_angles_nn.gltf' );

loader.parse( trimBuffer( content ), '', ( gltf ) => {

    var clip = gltf.animations[0];
    for (track of clip.tracks) {
        console.log(track);
    }
   // console.log( gltf.animations[0] );

}, ( e ) => {

    console.error( e );

} );

/**
 * The Node.js filesystem API ('fs') returns a Buffer instance, which may be a
 * view into a larger buffer. Because GLTFLoader parsing expects a raw
 * ArrayBuffer, we make a trimmed copy of the original here.
 *
 * @param  {Buffer} buffer
 * @return {ArrayBuffer}
 */
function trimBuffer ( buffer ) {

    const {byteOffset, byteLength} = buffer;

    return buffer.buffer.slice(byteOffset, byteOffset + byteLength);
}
