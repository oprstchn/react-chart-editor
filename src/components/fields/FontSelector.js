import Dropdown from './Dropdown';
import React, {Component} from 'react';
import {EditorControlsContext} from '../../context';
import {containerConnectedContextTypes} from '../../lib';
// import PropTypes from 'prop-types';

class FontSelector extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dropdown
        {...this.props}
        options={this.props.context.fontOptions.map(({value, label}) => ({
          label: <span style={{fontFamily: value}}>{label}</span>,
          value,
        }))}
      />
    );
  }
}

FontSelector.propTypes = {
  ...Dropdown.propTypes,
};

FontSelector.defaultProps = {clearable: false};

FontSelector.contextType = EditorControlsContext;
FontSelector.requireContext = containerConnectedContextTypes;

export default FontSelector;
