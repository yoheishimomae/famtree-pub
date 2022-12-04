import React, {Component} from 'react';
import './Button.css';

class Button extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={"Button " + this.props.className} selected={true} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}

export default Button;
