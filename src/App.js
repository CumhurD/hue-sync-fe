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
  const [selectedDevice, setSelectedDevice] = useState({ name: 'Living Room TV' });
  const [playingMedia, setPlayingMedia] = useState({ media: {}, filePath: './videos/JB7kxLltNyk.mp4' });
  const [logs, setLogs] = useState([]);
  const [videoTime, setVideoTime] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);

  async function GetDevice() {
    if (!selectedDevice.name)
      return console.warn('No device selected!');

    debugger;

    const deviceStatusResponse = await fetch(apiUrl + 'chromecast/' + selectedDevice.name);

    const pm = await deviceStatusResponse.json();
    pm.currentTime = pm.currentTime + 0.5;

    const currentUpdateDate = new Date().getTime()
    const elapsedTime = (currentUpdateDate - lastUpdate)/1000;
    const oldTime = videoTime + elapsedTime;
    const diff = pm.currentTime - oldTime;

      // setLogs(['diff ' + diff, ...logs]);

    if (diff > 0.10 || diff < -0.10) {
      // setLogs(['setCurrentSecond ' + diff, ...logs]);
      setLogs(['diff ' + diff + ' oldTime:  ' + oldTime + ' lastUpdate' + lastUpdate + ' videoTime' + videoTime, ...logs]);
      setVideoTime(pm.currentTime);
      setLastUpdate(currentUpdateDate);
    }

    if (!playingMedia.media.contentId || pm.media.contentId !== playingMedia.media.contentId) {
      setPlayingMedia(pm);
      setLastUpdate(currentUpdateDate);
      setVideoTime(pm.currentTime);
    }
  }

  useEffect(() => {
    async function GetDevices() {
      const devicesResponse = await fetch(apiUrl + 'chromecast');

      let devices = await devicesResponse.json();
      setChromecastDevices(devices);
    }

    GetDevices();
  }, []);

  useEffect(() => {
    GetDevice();
  }, [selectedDevice]);

  useInterval(GetDevice, 1000);

  function selectChromeCastDevice(device) {
    setSelectedDevice(device);
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

  const Logs = () => logs.map(function (log, i) {
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
        onClick={GetDevice}
      >
        Rewind
      </Button>
        {/* <YouTube
          videoId={playingMedia.media.contentId}
          opts={videoPlayerOpts}
          onReady={onVideoPlayerReady}
        /> */}

        {/* <Video source={{uri: playingMedia.filePath}}   // Can be a URL or a local file.
       ref={(ref) => {
         player = ref
       }}                                      // Store reference
       onBuffer={onBuffer}                // Callback when remote video is buffering
       onError={videoError}               // Callback when video cannot be loaded
      //  style={styles.backgroundVideo}
        /> */}


        <ReactPlayer
          url={playingMedia.filePath + `#t=` + (videoTime )}
          playing
        // width="400"
        // height="200"
        />
        <Logs></Logs>

      </header>
    </div>
  );
}

export default App;
