import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player';
import './App.css';
import useInterval from './useInterval';
const apiUrl = 'http://localhost:3600/';

function App() {

  const [chromecastDevices, setChromecastDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [playingMedia, setPlayingMedia] = useState({ media: {} });
  const [currentSecond, setCurrentSecond] = useState(0);
  const [logs, setLogs] = useState([]);
  const [videoPlayerOpts, setVideoPlayerOpts] = useState({
    height: '200',
    width: '400',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 1
    }
  });

  async function GetDevice() {
    if (!selectedDevice.name)
      return console.warn('No device selected!');

    // setLogs(['getting device info', ...logs]);
    const deviceStatusResponse = await fetch(apiUrl + 'chromecast/' + selectedDevice.name);

    const pm = await deviceStatusResponse.json();

    let start = Math.ceil(pm.currentTime);

    const diff = currentSecond - start;
    setLogs(['diff ' + diff, ...logs]);

    if (diff > 0.5 || diff < -0.5){
      // setLogs(['setCurrentSecond ' + diff, ...logs]);

      let clone = JSON.parse(JSON.stringify(videoPlayerOpts));
      clone.playerVars.start = start + 1;
      setVideoPlayerOpts(clone);
      setCurrentSecond(start + 1);
    }
    
    if (!playingMedia.media.contentId || pm.media.contentId != playingMedia.media.contentId){
      setPlayingMedia(pm);
    }
  }

  useEffect(() => {
    async function GetDevices() {
      const devicesResponse = await fetch(apiUrl + 'chromecast');

      let devices = await devicesResponse.json();
      console.log(devices)
      setChromecastDevices(devices);
    }

    GetDevices();
  }, []);

  useEffect(() => {
    GetDevice();
  }, [selectedDevice]);

  useInterval(GetDevice, 2000);
  useInterval(()=>{
    setCurrentSecond(currentSecond + 1);
  }, 1000);

  function selectChromeCastDevice(device) {
    setSelectedDevice(device);
  }

  function onVideoPlayerReady(target) {
    console.warn('onVideoPlayerReady');
    setLogs(['onVideoPlayerReady', ...logs]);
  }

  function goToSecond(){

  }

  const ChromeCastDevices = () => chromecastDevices.map(function (device, i) {
    return (

      <Button
        key={device.host}
        type="primary"
        icon={<DesktopOutlined />}
        onClick={() => selectChromeCastDevice(device)}
      >
        {device.name}
      </Button>
    );
  });

  const Logs = () => logs.map(function (log, i){
    return (
  <div className="logs" key={i}>{log}</div>
    )
  });


  return (
    <div className="App">
      <header className="App-header">

        <ChromeCastDevices></ChromeCastDevices>
        <Button
        type="primary"
        icon={<DesktopOutlined />}
        onClick={() => goToSecond()}
      >
        Rewind
      </Button>
      <YouTube
          videoId={playingMedia.media.contentId}
          opts={videoPlayerOpts}
          onReady={onVideoPlayerReady}
        />

      {/* <ReactPlayer
        url={`https://www.youtube.com/watch?v=${playingMedia.media.contentId}`}
        youtubeConfig={videoPlayerOpts}
        playing
        // width="400"
        // height="200"
      /> */}
      <Logs></Logs>

      </header>
    </div>
  );
}

export default App;
