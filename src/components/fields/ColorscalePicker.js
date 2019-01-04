import ColorscalePickerWidget from '../widgets/ColorscalePicker';
import Field from './Field';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connectToContainer} from 'lib';
import {EDITOR_ACTIONS} from 'lib/constants';

export class UnconnectedColorscalePicker extends Component {
  constructor(props) {
    super(props);
    this.onUpdate = this.onUpdate.bind(this);
  }

  onUpdate(colorscale, colorscaleType) {
    if (Array.isArray(colorscale)) {
      this.props.updatePlot(
        colorscale.map((c, i) => {
          let step = i / (colorscale.length - 1);
          if (i === 0) {
            step = 0;
          }
          return [step, c];
        }),
        colorscaleType
      );
      this.context.onUpdate({
        type: EDITOR_ACTIONS.UPDATE_TRACES,
        payload: {
          update: {autocolorscale: false},
          traceIndexes: [this.props.fullContainer.index],
        },
      });
    }
  }

  render() {
    const {fullValue} = this.props;
    const colorscale = Array.isArray(fullValue) ? fullValue.map(v => v[1]) : null;

    return (
      <Field {...this.props} fieldContainerClassName="field__colorscale">
        <ColorscalePickerWidget
          selected={colorscale}
          onColorscaleChange={this.onUpdate}
          initialCategory={this.props.initialCategory}
        />
      </Field>
    );
  }
}

UnconnectedColorscalePicker.propTypes = {
  fullValue: PropTypes.any,
  fullContainer: PropTypes.object,
  updatePlot: PropTypes.func,
  initialCategory: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorscalePicker.requireContext = {
  container: PropTypes.object,
  defaultContainer: PropTypes.object,
  fullContainer: PropTypes.object,
  updateContainer: PropTypes.func,
  traceIndexes: PropTypes.array,
  graphDiv: PropTypes.object,
  onUpdate: PropTypes.func,
};

export default connectToContainer(UnconnectedColorscalePicker);
