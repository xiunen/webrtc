export const decorator = (peer) => {
  peer.onconnection = (e) => {
    console.log('rtc onconnection', e)
  }

  peer.onicecandidate = (e) => {
    console.log('rtc onicecandidate', e)
  }

  peer.onconnectionstatechange = e => {
    console.log("Connection state change: " + peer.connectionState, e)
  };
  peer.onnegotiationneeded = e => {
    console.log("Negotiation needed: ", e);
  };
  peer.onicecandidateerror = e => {
    console.log("ICE candidate error: " + e.message);
  }
  peer.oniceconnectionstatechange = e => {
    console.log("ICE connection state change: " + peer.iceConnectionState, e);
  }
  peer.onicegatheringstatechange = e => {
    console.log("ICE gathering state change: " + peer.iceGatheringState, e);
  }
  peer.onsignalingstatechange = e => {
    console.log("Signaling state change: " + peer.signalingState, e);
  }
}