import React, { Component } from 'react';
import './FamPanel.css';

class FamPanel extends Component {

  render() {
    const item = this.props.data;

    const nameJP = item.JAPANESE_NAME;

    const B = item.BORN;
    const born = B ? (B.length > 4 ? new Date(B).toDateString().slice(4) : B) : null;
    const bornLoc = item.BIRTH_PLACE;

    const D = item.DEATH;
    let death = D ? (D.length > 4 ? new Date(D).toDateString().slice(4) : D) : null;
    const deathLoc = item.DEATH_PLACE;

    if (born && death) {
      const diff = new Date(D).getTime() - new Date(B).getTime();
      const year = new Date(diff).getUTCFullYear();
      const age = Math.abs(year - 1970);
      const abs = D.length > 4 && B.length > 4;
      death += ' (Age ' + age + (abs ? '' : '±') + ')';
    }

    return (
      <div className="FamPanel">
        <h2>{item.FULL_NAME}</h2>
        {nameJP &&
          <p>{nameJP}</p>
        }
        {born &&
          <div className="FamPanel-row">
            <label>Born</label>
            <p>
              {born}
              {bornLoc &&
                <React.Fragment>
                  <br/>{bornLoc}
                </React.Fragment>
              }
            </p>
          </div>
        }
        {death &&
          <div className="FamPanel-row">
            <label>Died</label>
            <p>
              {death}
              {deathLoc &&
                <React.Fragment>
                  <br/>{deathLoc}
                </React.Fragment>
              }
            </p>

          </div>
        }
      </div>
    );
  }
}

export default FamPanel;
