import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {containerConnectedContextTypes, unpackPlotProps} from '../../lib';

export class Section extends Component {
  constructor() {
    super();
    this.sectionVisible = true;
  }

  render() {
    if (!this.sectionVisible) {
      return null;
    }

    return (
      <div className="section">
        {this.props.name ? (
          <div className="section__heading">
            <div className="section__heading__text">{this.props.name}</div>
          </div>
        ) : null}
        {this.props.children}
      </div>
    );
  }
}

Section.plotly_editor_traits = {no_visibility_forcing: false};
Section.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
  attr: PropTypes.string,
};

class PlotlySectionElement extends Section {
  constructor(props) {
    super(props);
    const {context, ...rest} = props;
    this.determineVisibility(rest, context);
    console.log('PlotlySectionElement', props, context);
  }

  componentWillReceiveProps(nextProps) {
    const {context, ...rest} = nextProps;
    this.determineVisibility(rest, context);
  }

  determineVisibility(nextProps, nextContext) {
    const {isVisible} = unpackPlotProps(nextProps, nextContext);
    this.sectionVisible = Boolean(isVisible);

    React.Children.forEach(nextProps.children, child => {
      if (!child || this.sectionVisible) {
        return;
      }

      if (child.props.attr) {
        const plotProps = unpackPlotProps(child.props, nextContext);
        if (child.type.modifyPlotProps) {
          child.type.modifyPlotProps(child.props, nextContext, plotProps);
        }
        this.sectionVisible = this.sectionVisible || plotProps.isVisible;
        return;
      }

      if (!(child.type.plotly_editor_traits || {}).no_visibility_forcing) {
        // non-attr components force visibility (unless they don't via traits)
        this.sectionVisible = true;
        return;
      }
    });
  }
}

export default class PlotlySection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const Consumer = this.props.consumer;
    const {context, ...rest} = this.props;
    // eslint-disable-next-line no-undefined
    if (Consumer === null || Consumer === undefined) {
      return <PlotlySectionElement {...this.props} context={context} />;
    }
    return (
      <Consumer>
        {value => {
          const newContext = {...context, ...value};
          return <PlotlySectionElement {...rest} context={newContext} />;
        }}
      </Consumer>
    );
  }
}

PlotlySection.plotly_editor_traits = {no_visibility_forcing: true};
PlotlySection.contextTypes = containerConnectedContextTypes;
