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

// Create a loader
const loader = new THREE.GLTFLoader();

// Read model from disk and parse it.
const fullBody = fs.readFileSync( '../HumanSkeleton/SkeletalRig_v1_5_animated.gltf' );
const lowerBody = fs.readFileSync( '../HumanSkeleton/SkeletalRig_v1_5_run_constraint.gltf' );
let fullBodyAnim;
let emptyClip;
let lowerBodyAnim_read;
let lowerBodyAnim;
var prevKey = {'time': null, 'joints':[]};
let nextKey = {'time': null, 'joints':[]};

loader.parse( trimBuffer( fullBody ), '', ( gltf ) => {

    fullBodyAnim = gltf.animations[0];
    emptyClip = fullBodyAnim.clone();
    for (track of emptyClip.tracks) {
        track.times = [0];
        track.values = [];
    }
    emptyClip.resetDuration();

}, ( e ) => {

    console.error( e );

} );

loader.parse( trimBuffer( lowerBody ), '', ( gltf ) => {

    lowerBodyAnim_read = gltf.animations[0];
    console.log(lowerBodyAnim_read);

}, ( e ) => {

    console.error( e );

} );

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('emptyClipRequest', () => {
        socket.emit('emptyClip', THREE.AnimationClip.toJSON(emptyClip));
    });
    socket.on('readyToStream', () => {
        console.log("READY");
        lowerBodyAnim = lowerBodyAnim_read.clone();
        setInterval(() => {
            if (prevKey.time != null) {
                socket.emit('keyframe', prevKey);
            }
            generateKeyframe();}
            , 20);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

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

function generateKeyframe() {
    prevKey = nextKey;
    nextKey.joints = [];
    let time, name, val, vals, times;
    for (track of lowerBodyAnim.tracks) {
        if (track.times.length > 0) {
            name = track.name;
            vals = Array.from(track.values.values());
            if (name.includes("quaternion")) {
                val = vals.splice(0, 4);
            } else {
                val = vals.splice(0, 3);
            }
            track.values = vals;
            times = Array.from(track.times.values());
            time = times.shift();
            track.times = times;

            nextKey.joints.push({'name': name, 'value': val});
        }
    }
    nextKey.time = time;
}
