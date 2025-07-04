import React from 'react';

export class LayoutView extends React.Component<React.PropsWithChildren<{}>, {}> {
  render() {
    return (
      <div className="container view-layout">
        {/* Render children or a default layout */}
        {this.props.children}
      </div>
    );
  }
}
