import React, {Component} from 'react';
import './Tabs.css';
import Button from './Button';
import Counter from './Counter';

class Tabs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: 0
    };
  }

  render() {
    const items = this.props.items;
    const selected = this.props.selected;
    const variant = this.props.variant || '';

    return (
      <div className={"Tabs " + variant}>
        {items.map((item, index) =>{
          let extraClass = '';
          if (index === selected) {
            extraClass = "selected";
          }
          let label = item.label ? item.label : item;

          return (
            <Button key={index} className={extraClass} onClick={(e) => this.props.onChange(index)}>
              {label}
              {item.counter &&
                <Counter index={item.counter}/>
              }
            </Button>
          );
        })}
      </div>
    );
  }
}

export default Tabs;
