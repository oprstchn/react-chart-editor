import {UnconnectedDropdown} from './Dropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  connectToContainer,
  traceTypeToPlotlyInitFigure,
  plotlyTraceToCustomTrace,
  computeTraceOptionsFromSchema,
} from 'lib';
import {TRACES_WITH_GL} from 'lib/constants';
import {TraceTypeSelector, TraceTypeSelectorButton, RadioBlocks} from 'components/widgets';
import Field from './Field';
import {CogIcon} from 'plotly-icons';

class TraceSelector extends Component {
  constructor(props) {
    super(props);
    console.log({...this.props});
    this.updatePlot = this.updatePlot.bind(this);
    this.setGl = this.setGl.bind(this);
    this.glEnabled = this.glEnabled.bind(this);
    this.setTraceDefaults = this.setTraceDefaults.bind(this);
    this.toggleGlControls = this.toggleGlControls.bind(this);

    this.setTraceDefaults(props.container, props.fullContainer, props.updateContainer);
    this.setLocals(props);

    this.state = {showGlControls: false};
  }

  glEnabled() {
    return this.props.container.type && this.props.container.type.endsWith('gl') ? 'gl' : '';
  }

  toggleGlControls() {
    this.setState({showGlControls: !this.state.showGlControls});
  }

  setLocals(props) {
    const _ = props.localize;
    if (props.traceOptions) {
      this.traceOptions = props.traceOptions;
    } else if (props.traceTypesConfig) {
      this.traceOptions = props.traceTypesConfig.traces(_);
    } else if (props.plotSchema) {
      this.traceOptions = computeTraceOptionsFromSchema(props.plotSchema, _, this.props);
    } else {
      this.traceOptions = [{label: _('Scatter'), value: 'scatter'}];
    }
    if (props.container) {
      this.fullValue = plotlyTraceToCustomTrace(props.container);
    }
  }

  setTraceDefaults(container, fullContainer, updateContainer, gl) {
    if (container && !container.mode && fullContainer.type === 'scatter') {
      updateContainer({
        type: 'scatter' + (gl || this.props.glByDefault ? gl : this.glEnabled()),
        mode: fullContainer.mode || 'markers',
      });
    }
  }

  componentWillReceiveProps(nextProps, nextprops) {
    const {container, fullContainer, updateContainer} = nextProps;
    this.setTraceDefaults(container, fullContainer, updateContainer);
    this.setLocals(nextProps, nextprops);
  }

  updatePlot(value) {
    const {updateContainer} = this.props;
    const {glByDefault} = this.props;
    if (updateContainer) {
      updateContainer(traceTypeToPlotlyInitFigure(value, this.glEnabled() || glByDefault));
    }
  }

  setGl(value) {
    const {container, fullContainer, updateContainer} = this.props;
    const gl = 'gl';

    this.setTraceDefaults(container, fullContainer, updateContainer, value);

    const traceType =
      this.fullValue.endsWith(gl) && value === ''
        ? this.fullValue.slice(0, -gl.length)
        : this.fullValue;

    updateContainer(traceTypeToPlotlyInitFigure(traceType, value));
  }

  render() {
    const props = Object.assign({}, this.props, {
      fullValue: this.fullValue,
      updatePlot: this.updatePlot,
      options: this.traceOptions,
      clearable: false,
    });
    const {localize: _, advancedTraceTypeSelector} = this.props;

    const options = [{label: _('SVG'), value: ''}, {label: _('WebGL'), value: 'gl'}];

    // Check and see if the advanced selector prop is true
    if (advancedTraceTypeSelector) {
      return (
        <div>
          <Field {...props}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TraceTypeSelectorButton
                {...props}
                traceTypesConfig={this.props.traceTypesConfig}
                localize={this.props.localize}
                handleClick={() =>
                  this.props.openModal(TraceTypeSelector, {
                    ...props,
                    traceTypesConfig: this.props.traceTypesConfig,
                    glByDefault: this.props.glByDefault,
                    handleClose: this.props.handleClose,
                    localize: this.props.localize,
                    mapBoxAccess: this.props.localize,
                    chartHelp: this.props.chartHelp,
                  })
                }
              />
              {!TRACES_WITH_GL.includes(this.props.container.type) ? (
                ''
              ) : (
                <CogIcon className="menupanel__icon" onClick={this.toggleGlControls} />
              )}
            </div>
          </Field>
          {!(TRACES_WITH_GL.includes(this.props.container.type) && this.state.showGlControls) ? (
            ''
          ) : (
            <Field label={_('Rendering')}>
              <RadioBlocks
                options={options}
                activeOption={this.glEnabled()}
                onOptionChange={this.setGl}
              />
            </Field>
          )}
        </div>
      );
    }

    return <UnconnectedDropdown {...props} />;
  }
}

// TraceSelector.propsTypes = {
//   openModal: PropTypes.func,
//   advancedTraceTypeSelector: PropTypes.bool,
//   traceTypesConfig: PropTypes.object,
//   plotSchema: PropTypes.object,
//   config: PropTypes.object,
//   localize: PropTypes.func,
//   glByDefault: PropTypes.bool,
// };

TraceSelector.propTypes = {
  container: PropTypes.object.isRequired,
  fullContainer: PropTypes.object.isRequired,
  fullValue: PropTypes.any,
  updateContainer: PropTypes.func,
  openModal: PropTypes.func,
  advancedTraceTypeSelector: PropTypes.bool,
  traceTypesConfig: PropTypes.object,
  plotSchema: PropTypes.object,
  config: PropTypes.object,
  localize: PropTypes.func,
  glByDefault: PropTypes.bool,
};

TraceSelector.displayName = 'TraceSelector';

export default connectToContainer(TraceSelector);
