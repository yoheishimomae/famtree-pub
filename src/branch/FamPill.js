import React, { Component } from 'react';
import './FamPill.css';

class FamPill extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const item = this.props.data;
    console.log(item);
    this.props.onUpdate(item);
  }

  render() {
    const selected = this.props.selected;
    const item = this.props.data;
    const x = this.props.x;
    const y = this.props.y;
    const highlight = selected === item.id ? 'selected' : '';

    const h = item.BORN ? -22 : -10;

    let name = item.NAME + ' ' + item.SURNAME;

    if (this.props.language === 1) {
      if (item.JAPANESE_NAME) {
        name = item.JAPANESE_NAME;
      }
    }

    const style = {
      'top': y + 'px',
      'left': x + 'px',
      'marginTop': h + 'px'
    }

    const B = item.BORN;
    const BY = B.length > 4 ? new Date(B).getFullYear() : B;
    let time = BY;

    if (item.DEATH) {
      const D = item.DEATH;
      const DY = D.length > 4 ? new Date(D).getFullYear() : D;
      time += '~' + DY;
    }

    return (
      <div className={"FamPill " + highlight} style={style} onClick={this.onClick}>
        <div className="FamPill-avatar"/>
        <h3>{name}</h3>
        {time &&
          <p>{time}</p>
        }
      </div>
    );
  }
}

export default FamPill;
