import React, { Component } from 'react';
import './FamBranch.css';

const WIDTH = 1200;
const HEIGHT = 1200;
const COLORS = ['#F23D5E',
  '#024059',
  '#05A696',
  '#F2C641',
  '#D9593D'];

// const NODE_SPACE = 60;
// const BRANCH_SPACE = 30;
const SHOW_ORIGIN = true;
const PAD_X = SHOW_ORIGIN ? 260 : 120;
// const PAD_Y = 60;
const SPACE = 260;
// const NAME_FONT = '16px sans-serif';
// const C = [WIDTH/2, HEIGHT/2];
// const NODE_SIZE = 150;
// const NODE_OFFSET = 50;
// const [famData] = useState('');

class FamBranch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: null,
      pills: []
    };

    this.canvas = React.createRef();
    this.first = false;
  }

  componentDidMount() {
    if (this.first) return;
    this.first = true;
    this.setupCanvas();
    this.updateCanvas();
  }

  componentDidUpdate(nextProps, nextState) {
    this.updateCanvas();
  }

  setupCanvas() {
    const canvas = this.canvas.current;
    const ctx = this.canvas.current.getContext('2d');
    canvas.style.width = WIDTH + "px";
    canvas.style.height = HEIGHT + "px";
    canvas.width = WIDTH * window.devicePixelRatio;
    canvas.height = HEIGHT * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio,window.devicePixelRatio);
  }

  updateCanvas() {
    console.log('update canvas');

    const ctx = this.canvas.current.getContext('2d');

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.drawRings();
    this.processLines(this.props.data);
  }

  /*--------------------------------------------
  Draw
  ---------------------------------------------*/

  processLines(lines) {
    const ctx = this.canvas.current.getContext('2d');
    for (let line of lines) {

      let isEx = line.ex;
      let isBloodline = line.bloodline;

      ctx.beginPath();

      ctx.lineWidth = isBloodline ? 2 : 2;
      ctx.strokeStyle = isBloodline ? '#333' : '#aaa';

      if (isEx) {
        ctx.lineWidth = 3;
        ctx.setLineDash([3, 2]);
      }

      this.drawLines(line.pts);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawRings() {
    const ctx = this.canvas.current.getContext('2d');
    // const c = [WIDTH/2, HEIGHT/2];
    const genMax = this.props.rings;
    const start = 0;

    for (let i = start; i < genMax-1 + start; i++) {
      // let RADG = this.getRadius(i+1);
      const x = PAD_X + SPACE*i - 40;

      ctx.beginPath();
      ctx.lineWidth = 8;
      // ctx.setLineDash([4, 4]);
      ctx.strokeStyle = COLORS[i - start];
      ctx.globalAlpha = 0.12;
      // ctx.arc(c[0], c[1], RADG, 0, 2 * Math.PI, false);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      if (i === 0) {
        const branchIndex = this.props.branchIndex;
        // console.log(this.props.famBranchData);
        const x = PAD_X + SPACE*i - 40;
        const L = 200;
        const X = x - 35;
        const TIP = 20;
        const NODE_SPACE = 64;

        ctx.beginPath();
        ctx.lineWidth = 2;
        // ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#333";

        if (branchIndex !== 1) {
          ctx.beginPath();
          ctx.moveTo(X, HEIGHT/2 - NODE_SPACE/2);
          ctx.lineTo(X, HEIGHT/2 - L/2 - NODE_SPACE/2);
          ctx.stroke();

          ctx.setLineDash([4, 4]);
          ctx.lineTo(X, HEIGHT/2 - L/2 - NODE_SPACE/2 - TIP);
          ctx.stroke();

          ctx.setLineDash([]);
        }

        if (branchIndex !== 8) {
          ctx.beginPath();
          ctx.moveTo(X, HEIGHT/2 - NODE_SPACE/2);
          ctx.lineTo(X, HEIGHT/2 + L/2 -NODE_SPACE/2);
          ctx.stroke();

          ctx.setLineDash([4, 4]);
          ctx.lineTo(X, HEIGHT/2 + L/2 - NODE_SPACE/2 + TIP);
          ctx.stroke();

          ctx.setLineDash([]);
        }

      }

    }
  }

  /*--------------------------------------------
  Utils
  ---------------------------------------------*/

  drawLines(pts) {
    const ctx = this.canvas.current.getContext('2d');
    const r = 8;
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      }
      else {
        const np = pts[i+1];
        const pp = pts[i-1];

        if (np && np.y <= pp.y + r*2 && np.y >= pp.y - r*2) {
          np.y = pp.y;
        }
        else if (np && !(np.y === pp.y)) {

          if (p.x === np.x) {
            let d1 = p.x > pp.x ? -r : r;
            let d2 = p.y > np.y ? -r : r;
            ctx.lineTo(p.x + d1, p.y);
            ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + d2);
          }
          else {
            let d1 = p.y >= pp.y ? -r : r;
            let d2 = p.x >= np.x ? -r : r;
            ctx.lineTo(p.x, p.y + d1);
            ctx.quadraticCurveTo(p.x, p.y, p.x + d2, p.y);
          }
          // path.lineTo(r, y+h-radius);
          // ctx.quadraticCurveTo(r, y, r, y+radius);
        }
        else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }
  }

  render() {
    return (
      <canvas ref={this.canvas} width={WIDTH} height={HEIGHT} index={this.props.index}/>
    );
  }
}

export default FamBranch;
