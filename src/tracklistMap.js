const tracklist = {
    id: String, // if sorce public = spotify playlist id else local id
    name: String,
    image: String,
    isOwnedbyMe: Boolean,
    source: String, // "spotify" or "local"
    tracks: Array,// of track.jsx objects
    tracksTotal: Number,
    loaded: Boolean, // whether tracks have been fetched from spotify api yet
    nexrTrackURL: String // for spotify api pagination
}