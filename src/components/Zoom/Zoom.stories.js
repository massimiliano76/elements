import React from 'react';
import Zoom from './Zoom';
import Map from '../Map/Map';
import ElementsProvider from '../_common/ElementsProvider';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapOptions from '../../util/mockMapOptions';

storiesOf('Zoom', module)
  .addDecorator(withKnobs)
  .add('Default', () => {
    return (
      <ElementsProvider>
        <Map mapOptions={mapOptions} />
        <Zoom
          sx={{ bg: 'secondary' }}
          circular={boolean('circular', false)}
          horizontal={boolean('horizontal', false)}
        />
      </ElementsProvider>
    );
  });
