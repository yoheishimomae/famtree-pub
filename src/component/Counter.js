import React, {Component} from 'react';
import './Counter.css';

class Counter extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Counter ">
        {this.props.index}
      </div>
    );
  }
}

export default Counter;
