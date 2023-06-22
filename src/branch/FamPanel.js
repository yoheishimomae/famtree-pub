import React, { Component } from 'react';
import './FamPanel.css';

const months = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
}

class FamPanel extends Component {

  render() {

    function formatDate(D) {
      const d = new Date(D);
      const year  = d.getUTCFullYear();
      const date = d.getUTCDate();
      const mon = d.getUTCMonth();

      return months[mon] + ' ' + date + ', ' + year;
    }

    const item = this.props.data;

    const nameJP = item.JAPANESE_NAME;

    const B = item.BORN;
    const born = B ? (B.length > 4 ? formatDate(B) : B) : null;
    const bornLoc = item.BIRTH_PLACE;

    const D = item.DEATH;
    let death = D ? (D.length > 4 ? formatDate(D) : D) : null;
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
