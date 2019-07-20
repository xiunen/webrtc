import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import {connect} from 'react-redux'

import style from './style.less';

class Toolbar extends PureComponent {
  static propTypes = {
    connection: PropTypes.object
  }

  state = {
    fid: `fid-${Date.now()}`,
    pid: `pid-${Date.now()}`,
    videoing: false
  }
  
  fileReader = new FileReader();

  componentDidMount(){
  }

  handleFile=(e)=>{
    const file =e.target.files[0]
    this.setState({fid:`fid-${Date.now()}` })
    const {connection} = this.props;
    if(connection.rtc){
      connection.rtc.sendFile(file)
    }
  }
  handleImage=(e)=>{
    const file =e.target.files[0]
    this.setState({fid:`fid-${Date.now()}` })
    const {connection} = this.props;
    if(connection.rtc){
      connection.rtc.sendImage(file)
    }
  }
  handleVideo=(e)=>{
    this.setState({videoing: true})
    navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    }).then().catch(e=>{
      this.setState({videoing: false})
    })
  }

  render() {
    return (
      <div className={style.container}>
        <label htmlFor='file-input'>
          <input id='file-input' onChange={this.handleFile} type='file' key={this.state.fid}/>
          <span>传文件</span>
        </label>
        <label htmlFor='image-input'>
          <input accept="image/*" id='image-input' onChange={this.handleImage} type='file' key={this.state.pid}/>
          <span>发图片</span>
        </label>
        <label htmlFor='video-btn'>
          <button id='video-btn' disabled={this.state.videoing} onClick={this.handleVideo}>视频</button>
        </label>
      </div>
    );
  }
}

export default connect(state=>{
  const {connections, selectedUser} = state
  return {
    connection: connections[selectedUser.id]
  }
})( cssModules(Toolbar, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
