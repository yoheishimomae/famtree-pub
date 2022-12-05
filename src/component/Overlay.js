import React, {Component} from 'react';
import './Overlay.css';

class Overlay extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={"Overlay "  + this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

export default Overlay;
