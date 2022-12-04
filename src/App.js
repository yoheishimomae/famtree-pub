import React, {Component} from 'react';
import './App.css';

import Papa from "papaparse";
import FamMap from './graph/FamMap';
import FamBranch from './branch/FamBranch';
import FamPanel from './branch/FamPanel';
import FamPill from './branch/FamPill';
import FamData from './model/FamData';
// import FamD3 from './graph/FamD3';
import Button from './component/Button';
import Tabs from './component/Tabs';

const URL_BASE = "https://docs.google.com/spreadsheets/d/e/_UID_/pub?gid=0&single=true&output=csv&v=" + new Date().valueOf();
const TAB_MAP = [
  "Overview",
  "Branches"
];
const LANGUAGE_MAP = [
  "English",
  "日本語 (Beta)"
];

const SHOW_LANGUAGE = false;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      famData: null,
      rotation: 0,
      branchIndex: 0,
      languageIndex: 0,
      famPanel: null
    };
    this.first = false;
    this.animation = null;
    this.rotationTarget = 0;
    this.branchMap = [{label:"Overview"}];

    // this.onTabChange = this.onTabChange.bind(this);
    this.onBranchChange = this.onBranchChange.bind(this);
    this.rotateLeft = this.rotateLeft.bind(this);
    this.rotateRight = this.rotateRight.bind(this);
    this.startRotation = this.startRotation.bind(this);
    this.onUpdateFamPanel = this.onUpdateFamPanel.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
  }

  componentDidMount() {
    var self = this;
    if (this.first) return;
    this.first = true;

    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const URL = URL_BASE.replace('_UID_', params.get('id'));

    console.log('init');
    fetch(URL)
    .then(response => response.text())
    .then((rawdata) => {
      // console.log(rawdata);
      // parse CSV
      console.log('data loaded')
      Papa.parse(rawdata, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          let famData = new FamData(results);
          self.setState({famData: famData});
          self.createBranchMap(famData);
        },
      });
    })
  }

  // onTabChange(index) {
  //   this.setState({tabIndex: index});
  // }

  onLanguageChange(index) {
    this.setState({languageIndex: index});
  }

  onBranchChange(index) {
    this.setState({branchIndex: index, famPanel: null});
  }

  createBranchMap(famData) {
    let data = famData.getFamilyTree();

    this.branchMap[0].counter = data[0].branchSize;

    for (let i = 0; i < data[0].children.length; i++) {
      let child = data[0].children[i];
      this.branchMap.push({label: child.NAME, counter: child.branchSize});
    }
    // console.log(this.branchMap);
  }

  startRotation(r) {
    var self = this;
    const target = r;
    // if (r <= 0) {
    //   r += 360;
    // }
    // else if (r >= 360) {
    //   r -= 360;
    // }

    self.setState({rotation: r});
  }

  rotateRight() {
    let rot = this.state.rotation;
    rot += 30;
    this.startRotation(rot)
    console.log('rotation set to', rot);
  }

  rotateLeft() {
    let rot = this.state.rotation;
    rot -= 30;
    this.startRotation(rot)
    console.log('rotation set to', rot);
  }

  onUpdateFamPanel(e) {
    // console.log('update Fampanel', e);
    this.setState({famPanel: e});
  }

  render() {
    const showOverview = this.state.branchIndex === 0;
    const branchIndex = showOverview ? 0 : this.state.branchIndex - 1;
    const famPanel = this.state.famPanel;
    const famBranchData = this.state.famData ? this.state.famData.getBranch(branchIndex) : null;
    const lgIndex = this.state.languageIndex;

    return (
      <div className="App">
        <div className="App-wrapper">
          {this.state.famData ?
            <React.Fragment>
              <div className="Tab-group">
                <Tabs items={this.branchMap} selected={this.state.branchIndex} onChange={this.onBranchChange} />
              </div>
              {SHOW_LANGUAGE &&
                <Tabs items={LANGUAGE_MAP} variant="right" selected={lgIndex} onChange={this.onLanguageChange} />
              }
              {showOverview ?
                <React.Fragment>
                  <FamMap data={this.state.famData} rotation={this.state.rotation} language={lgIndex}/>
                  <div className="Button-group">
                    <Button onClick={this.rotateLeft}>Rotate left</Button>
                    <Button onClick={this.rotateRight}>Rotate right</Button>
                  </div>
                </React.Fragment>
              :
                <React.Fragment>
                  <div className="FamBranch-wrap">
                    <div className="FamBranch-inner-wrap">
                    <FamBranch data={famBranchData.lines} branchIndex={this.state.branchIndex} rings={this.state.famData.getGenMax()}/>
                      {famBranchData.texts.map((item, index) =>{
                        return (
                          <FamPill key={index} data={item.item} x={item.x} y={item.y} onUpdate={this.onUpdateFamPanel} selected={famPanel && famPanel.id} language={lgIndex}/>
                        );
                      })}
                    </div>
                  </div>
                  {famPanel &&
                    <FamPanel data={famPanel}/>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          :
            <p>Loading...</p>
          }
        </div>
      </div>
    );
  }
}

export default App;
