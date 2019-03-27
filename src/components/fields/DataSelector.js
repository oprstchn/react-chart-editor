import DropdownWidget from '../widgets/Dropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Field from './Field';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {connectToContainer, maybeAdjustSrc, maybeTransposeData, adjustValue, adjustData} from 'lib';
import {TRANSFORMS_LIST} from 'lib/constants';
import {EditorControlsContext} from '../../context';

export function attributeIsData(meta = {}) {
  return meta.valType === 'data_array' || meta.arrayOk;
}

export class UnconnectedDataSelector extends Component {
  constructor(props, context) {
    super(props, context);

    this.updatePlot = this.updatePlot.bind(this);
    this.setLocals(props, context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setLocals(nextProps, nextContext);
  }

  setLocals(props, context) {
    this.dataSources = context.dataSources || {};
    this.dataSourceOptions = context.dataSourceOptions || [];

    this.srcAttr = props.attr + 'src';
    this.srcProperty = nestedProperty(props.container, this.srcAttr).get();
    this.fullValue = this.context.srcConverters
      ? this.context.srcConverters.toSrc(this.srcProperty, props.container.type)
      : this.srcProperty;

    this.is2D = false;
    if (props.container) {
      this.is2D =
        ((props.attr === 'x' || props.attr === 'y') &&
          [
            'scatter',
            'scattergl',
            'bar',
            'heatmap',
            'heatmapgl',
            'violin',
            'box',
            'contour',
            'contourgl',
          ].includes(props.container.type)) ||
        (props.attr === 'z' &&
          [
            'contour',
            'contourgl',
            'heatmap',
            'heatmapgl',
            'surface',
            'carpet',
            'contourcarpet',
          ].includes(props.container.type)) ||
        (props.container.type === 'table' && props.attr !== 'columnorder') ||
        Array.isArray(this.fullValue);
    }

    this.hasData = props.container ? props.attr in props.container : false;
  }

  updatePlot(value) {
    if (!this.props.context.updateContainer) {
      return;
    }

    const update = {};

    const adjustedValue = adjustValue(value, this.props.attr);
    const data = adjustData(this.dataSources, adjustedValue);

    update[this.props.attr] = maybeTransposeData(data, this.srcAttr, this.props.container.type);
    update[this.srcAttr] = maybeAdjustSrc(adjustedValue, this.srcAttr, this.props.container.type, {
      fromSrc: this.context.srcConverters ? this.context.srcConverters.fromSrc : null,
    });

    this.props.context.updateContainer(update);
  }

  render() {
    const {label} = this.props;
    let newLabel;
    if (typeof label === 'object') {
      const traceType = this.props.container.type;
      if (label[traceType]) {
        newLabel = label[traceType];
      } else {
        newLabel = label['*'];
      }
    } else {
      newLabel = label;
    }

    return (
      <Field {...{...this.props, label: newLabel}}>
        <DropdownWidget
          options={this.dataSourceOptions}
          value={this.fullValue}
          onChange={this.updatePlot}
          multi={this.is2D}
          searchable={true}
          clearable={true}
          placeholder={this.hasData ? 'Data inlined in figure' : 'Choose data...'}
          disabled={this.dataSourceOptions.length === 0}
          components={this.props.dataSourceComponents}
        />
      </Field>
    );
  }
}

UnconnectedDataSelector.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  container: PropTypes.object,
  context: PropTypes.any,
  ...Field.propTypes,
};

UnconnectedDataSelector.requireContext = {
  dataSources: PropTypes.object,
  dataSourceComponents: PropTypes.object,
  dataSourceOptions: PropTypes.array,
  srcConverters: PropTypes.shape({
    toSrc: PropTypes.func.isRequired,
    fromSrc: PropTypes.func.isRequired,
  }),
  container: PropTypes.object,
};

UnconnectedDataSelector.contextType = EditorControlsContext;

function modifyPlotProps(props, context, plotProps) {
  if (
    attributeIsData(plotProps.attrMeta) &&
    (context.container && TRANSFORMS_LIST.indexOf(context.container.type) === -1)
  ) {
    plotProps.isVisible = true;
  }
}

export default connectToContainer(UnconnectedDataSelector, {modifyPlotProps});
