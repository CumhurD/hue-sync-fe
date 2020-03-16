import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import YouTube from 'react-youtube';
import './App.css';
import useInterval from './useInterval';
const apiUrl = 'http://localhost:3600/';

function App() {

  const [chromecastDevices, setChromecastDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [playingMedia, setPlayingMedia] = useState({ media: {} });
  const [videoPlayerOpts, setVideoPlayerOpts] = useState({
    height: '390',
    width: '640',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 1
    }
  });

  async function GetDevice() {
    console.log('getting device info');
    const deviceStatusResponse = await fetch(apiUrl + 'chromecast/' + selectedDevice.name);

    const pm = await deviceStatusResponse.json();

    const start = Math.ceil(pm.currentTime) + 1;
    videoPlayerOpts.playerVars.start = start;
    setVideoPlayerOpts(videoPlayerOpts);
    setPlayingMedia(pm);
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

  function selectChromeCastDevice(device) {
    setSelectedDevice(device);
  }

  function onVideoPlayerReady(target) {
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


  return (
    <div className="App">
      <header className="App-header">

        <ChromeCastDevices></ChromeCastDevices>

        <YouTube
          videoId={playingMedia.media.contentId}
          opts={videoPlayerOpts}
          onReady={onVideoPlayerReady}
        />

      </header>
    </div>
  );
}

export default App;
