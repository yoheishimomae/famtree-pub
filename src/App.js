import React, {Component} from 'react';
import './App.css';

import Papa from "papaparse";
import FamMap from './graph/FamMap';
import FamBranch from './branch/FamBranch';
import FamPanel from './branch/FamPanel';
import FamPill from './branch/FamPill';
import FamData from './model/FamData';
import Button from './component/Button';
import Overlay from './component/Overlay';
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
      famPanel: null,
      hideOverlay: false,
      removeOverlay: false,
      zoomedIn: false
    };
    this.first = false;
    this.animation = null;
    this.rotationTarget = 0;
    this.surnameFirst = false;
    this.simplify = false;
    this.branchMap = [{label:"Overview"}];

    // this.onTabChange = this.onTabChange.bind(this);
    this.onBranchChange = this.onBranchChange.bind(this);
    this.rotateLeft = this.rotateLeft.bind(this);
    this.rotateRight = this.rotateRight.bind(this);
    this.toggleZoom = this.toggleZoom.bind(this);
    this.onScroll = this.onScroll.bind(this);
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
    this.surnameFirst = params.get('surnameFirst') && params.get('surnameFirst').toLowerCase() === "true";
    this.simplify = params.get('simplify') && params.get('surnameFirst').toLowerCase() === "true";

    console.log('init', 'surnameFirst', this.surnameFirst, 'simplify', this.simplify);

    fetch(URL)
    .then(response => response.text())
    .then((rawdata) => {
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
    const timer = window.location.href.indexOf("localhost") > -1 ? 500 : 5000;

    setTimeout(function() {
      self.setState({hideOverlay: true});
      setTimeout(function() {
        self.setState({removeOverlay: true});
      }, 500);
    }, timer);
  }

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
      let label = this.surnameFirst ? child.SURNAME + child.NAME : child.NAME;
      this.branchMap.push({label: label, counter: child.branchSize});
    }
  }

  startRotation(r) {
    var self = this;
    const target = r;
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

  toggleZoom() {
    this.setState({zoomedIn: !this.state.zoomedIn});
  }

  onScroll(e) {
    if (this.state.branchIndex === 0) {
      let rot = this.state.rotation;
      rot += e.deltaY * 0.25;
      this.startRotation(rot)
    }
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
    const overlayClass = this.state.hideOverlay ? 'hidden' : '';
    const zoomedIn = this.state.zoomedIn;
    const surnameFirst = this.surnameFirst;

    return (
      <div className="App"  onWheel={(e) => this.onScroll(e)}>
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
                  <FamMap data={this.state.famData} rotation={this.state.rotation} language={lgIndex} zoomedIn={this.state.zoomedIn} surnameFirst={surnameFirst} simplify={this.simplify}/>
                  {/*
                  <div className="Button-group right">
                    <Button onClick={this.rotateLeft}>Rotate left</Button>
                    <Button onClick={this.rotateRight}>Rotate right</Button>
                  </div>
                  */}
                  <div className="Button-group right">
                    <Button onClick={this.toggleZoom}>Zoom {zoomedIn ? "out" : "in"}</Button>
                  </div>
                </React.Fragment>
              :
                <React.Fragment>
                  <div className="FamBranch-wrap">
                    <div className="FamBranch-inner-wrap">
                    <FamBranch data={famBranchData.lines} branchIndex={this.state.branchIndex} rings={this.state.famData.getGenMax()} surnameFirst={surnameFirst}/>
                      {famBranchData.texts.map((item, index) =>{
                        return (
                          <FamPill key={index} data={item.item} x={item.x} y={item.y} onUpdate={this.onUpdateFamPanel} selected={famPanel && famPanel.id} language={lgIndex} surnameFirst={surnameFirst}/>
                        );
                      })}
                    </div>
                  </div>
                  {famPanel &&
                    <FamPanel data={famPanel} surnameFirst={surnameFirst}/>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          :
            <p>Loading...</p>
          }
          {!this.state.removeOverlay &&
            <Overlay className={overlayClass}>Please do not share this website or the information on this website with anyone.</Overlay>
          }
        </div>
      </div>
    );
  }
}

export default App;
