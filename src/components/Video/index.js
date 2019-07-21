import React, {Component} from 'react';
import cssModules from 'react-css-modules'
import {connect} from 'react-redux'

import style from './style.less'

class Video extends Component{

    componentDidUpdate(prevProps){
        if(this.local && prevProps.local !== this.props.local){
            this.local.srcObject = this.props.local
            this.local.play()
        }
        if(this.remote && prevProps.remote !== this.props.remote){
            this.remote.srcObject = this.props.remote
        }
    }

    renderLocal(){
        const {local} = this.props
        if(!local)return null;
        return (
        <video className='local' ref={c=>{this.local=c}}></video>
        )
    }

    renderRemote(){
        const {remote} = this.props
        if(!remote)return null;
        return (
            <video className='remote' ref={c=>{this.remote=c}}></video>
        )
    }

    render(){
        const {currentUser} = this.props

        if(!currentUser)return null;


        return (
            <div>
                {this.renderLocal()}
                {this.renderRemote()}
            </div>
        )
    }
}

export default connect(state=>{
    const {videos, currentUser} = state;
    return {
        ...videos,
        currentUser
    }
})(cssModules(Video, style, {allowMultiple:true}));