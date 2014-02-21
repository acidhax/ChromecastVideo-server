
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var app = express();
var fs = require('fs');
var path = require('path');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.render('index', {title: "title"});
});

app.get('/codec', function (req, res) {
  var movie = req.query.path || "C:\\Users\\Mathieu\\Downloads\\IFrankenstein\\I.Frankenstein.2014.HDScr.x264.AC3.mkv";
  var f = new ffmpeg.Metadata(movie,function(metadata, err) {
    res.send(err, metadata);
  });
});

app.get('/stream', function (req, res) {
  var movie = req.query.path || "C:\\Users\\Mathieu\\Downloads\\IFrankenstein\\I.Frankenstein.2014.HDScr.x264.AC3.mkv";

  var contentType = path.extname(movie).split('.')[1];

  res.contentType('video/' + contentType);

  if (!inProgress[movie]) {
    inProgress[movie] = true;
    var f = new ffmpeg.Metadata(movie,function(metadata, err) {
      // TODO: Convert to MP4.
      var proc = new ffmpeg({source: movie, timeout: false, end:true})
      if (!supportedVideoCodecs[metadata.video.codec.toLowerCase()]) {
        // TODO: Convert video to MP4
      } else {
        .addOptions(['-vcodec copy'])
        .addOptions(['-f ' + metadata.video.container])
      }
      if (!supportedAudioCodecs[metadata.audio.codec.toLowerCase()]) {
        // WE GOTS TO CONVERT!
        proc.withAudioCodec(preferredAudioCodec)
      } else {
        proc.addOptions(['-acodec copy'])
      }
      proc.onProgress(function(update) {
        // frames, currentFps, currentKbps, targetSize, timemark, percent
        console.log(update);
      })
      .onCodecData(function(codecinfo) {
        console.log("CODEC INFO: ", codecinfo);
      })
      .addOptions(['-f ' + metadata.video.container])
      .writeToStream(res, function(retcode, error){
        console.log('file has been converted succesfully', retcode, error);
        delete inProgress[movie];
      });
      // .saveToFile(newPath, function (code, err) {
      //   delete inProgress[newPath];
      //   console.log('file has been converted succesfully', code, err);
      //   var f = new ffmpeg.Metadata(newPath,function(metadata, err) {
      //     console.log("NEW METADATA: ", newPath, metadata);
      //   });
      // });
      // res.end();
      console.log(require('util').inspect(metadata, false, null));
    });
  } else {
    res.end();
  }
});
var inProgress = {

}
var preferredVideoCodec = "h264";
var preferredAudioCodec = "libvo_aacenc";

var supportedVideoCodecs = {
  "vp8": true,
  "h264": true,
  "webm": true
}

var supportedAudioCodecs = {
  "mp3": true,
  "vorbis": true,
  "libvo_aacenc": true
}

app.listen(app.get('port'), function(){console.log("Listening on port", app.get('port'))});