import PanelEmpty from './PanelEmpty';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {LayoutPanel} from './derived';

import {EditorControlsContext} from '../../EditorControls';
import {PanelsWithSidebarContext} from '../PanelMenuWrapper';

class TraceRequiredPanelWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <EditorControlsContext.Consumer>
        {({fullData, localize}) => (
          <PanelsWithSidebarContext.Consumer>
            {({setPanel}) => {
              const {children, ...rest} = this.props;
              const newProps = {...rest, fullData, localize, setPanel};
              return <TraceRequiredPanel {...newProps}>{children}</TraceRequiredPanel>;
            }}
          </PanelsWithSidebarContext.Consumer>
        )}
      </EditorControlsContext.Consumer>
    );
  }
}

class TraceRequiredPanel extends Component {
  hasTrace() {
    return this.props.fullData.filter(trace => trace.visible).length > 0;
  }

  render() {
    const {localize: _, children, ...rest} = this.props;

    if (!this.props.visible) {
      return null;
    }

    return this.hasTrace() ? (
      <LayoutPanel {...rest}>{children}</LayoutPanel>
    ) : (
      <PanelEmpty heading={_("Looks like there aren't any traces defined yet.")}>
        <p>
          {_('Go to the ')}
          <a onClick={() => this.props.setPanel('Structure', 'Traces')}>{_('Traces')}</a>
          {_(' panel under Structure to define traces.')}
        </p>
      </PanelEmpty>
    );
  }
}

TraceRequiredPanel.propTypes = {
  children: PropTypes.node,
  visible: PropTypes.bool,
  fullData: PropTypes.array,
  localize: PropTypes.func,
  setPanel: PropTypes.func,
};

TraceRequiredPanel.defaultProps = {
  visible: true,
};

// TraceRequiredPanel.contextTypes = {
//   fullData: PropTypes.array,
//   localize: PropTypes.func,
//   setPanel: PropTypes.func,
// };

export default TraceRequiredPanelWrapper;
