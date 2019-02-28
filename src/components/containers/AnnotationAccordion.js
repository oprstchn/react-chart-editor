import PlotlyFold from './PlotlyFold';
import {LayoutPanel} from './derived';
import {PanelMessage} from './PanelEmpty';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connectAnnotationToLayout, getParsedTemplateString} from 'lib';
import {EditorControlsContext} from '../../context';

const AnnotationFold = connectAnnotationToLayout(PlotlyFold);

class AnnotationAccordion extends Component {
  render() {
    const {
      layout: {annotations = [], meta = []},
      localize: _,
    } = this.context;
    const {canAdd, children} = this.props;

    const content =
      annotations.length &&
      annotations.map((ann, i) => {
        return (
          <AnnotationFold
            key={i}
            annotationIndex={i}
            name={getParsedTemplateString(ann.text, meta)}
            canDelete={canAdd}
          >
            {children}
          </AnnotationFold>
        );
      });

    const addAction = {
      label: _('Annotation'),
      handler: ({layout, updateContainer}) => {
        let annotationIndex;
        if (Array.isArray(layout.annotations)) {
          annotationIndex = layout.annotations.length;
        } else {
          annotationIndex = 0;
        }

        const key = `annotations[${annotationIndex}]`;
        const value = {text: _('new text')};

        if (updateContainer) {
          updateContainer({[key]: value});
        }
      },
    };

    return (
      <LayoutPanel addAction={canAdd ? addAction : null}>
        {content ? (
          content
        ) : (
          <PanelMessage heading={_('Call out your data.')}>
            <p>
              {_(
                'Annotations are text and arrows you can use to point out specific parts of your figure.'
              )}
            </p>
            <p>{_('Click on the + button above to add an annotation.')}</p>
          </PanelMessage>
        )}
      </LayoutPanel>
    );
  }
}

AnnotationAccordion.contextType = EditorControlsContext;

AnnotationAccordion.propTypes = {
  children: PropTypes.node,
  canAdd: PropTypes.bool,
};

export default AnnotationAccordion;
