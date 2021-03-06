import React, { useContext, useState } from 'react';
import {
  Button,
  Flex,
  Box,
  Link,
  Text,
  Input,
  Checkbox,
  Label
} from '@theme-ui/components';
import List from '../_primitives/List';
import ListItem from '../_primitives/ListItem';
import bbox from '@turf/bbox';
import BaseComponent from '../_common/BaseComponent';
import Context from '../../DefaultContext';
import mapExists from '../../util/mapExists';
import Importer from './importer/index';

const importer = new Importer();

const AddData = ({ layers, panel, ...rest }) => {
  const config = useContext(Context);
  const map = config.map;

  // state
  const [tab, setTab] = useState('file'); // file, url, layers
  const [tmpLayers, setTmpLayers] = useState([]); // added layers
  const [file, setFile] = useState(null); //file to upload

  const _addLayer = (sourceId, geojson) => {
    // add multiple layers based on source geometry
    // Point, MultiPoint
    // LineString, MultiLineString
    // Polygon, MultiPolygon
    let geomTypes = [];
    geojson.features.map(feature => {
      if (geomTypes.indexOf(feature.geometry.type) == -1)
        geomTypes.push(feature.geometry.type);
    });

    geomTypes.forEach(type => {
      const layerId = `${sourceId}-${type}`;
      map.addLayer({
        id: layerId,
        type: _type(type),
        source: sourceId,
        paint: _paint(type),
        filter: _filter(type),
        layout: {
          visibility: 'visible'
        }
      });
      setTmpLayers([...tmpLayers, layerId]);
    });

    function _type(geomType) {
      let type = undefined;
      switch (geomType) {
        case 'Point':
        case 'MultiPoint':
          type = 'circle';
          break;
        case 'LineString':
        case 'MultiLineString':
          type = 'line';
          break;
        case 'Polygon':
        case 'MultiPolygon':
          type = 'fill';
          break;
      }
      return type;
    }

    function _paint(geomType) {
      let paint = undefined;
      switch (geomType) {
        case 'Point':
        case 'MultiPoint':
          paint = {
            'circle-radius': 6,
            'circle-color': '#B42222',
            'circle-opacity': 0.6
          };
          break;

        case 'LineString':
        case 'MultiLineString':
          paint = {
            'line-color': '#888',
            'line-width': 8
          };
          break;

        case 'Polygon':
        case 'MultiPolygon':
          paint = {
            'fill-color': '#088',
            'fill-opacity': 0.8
          };
          break;
      }
      return paint;
    }

    function _filter(geomType) {
      let filter = undefined;
      switch (geomType) {
        case 'Point':
        case 'MultiPoint':
          filter = ['==', '$type', 'Point'];
          break;
        case 'LineString':
        case 'MultiLineString':
          filter = ['==', '$type', 'LineString'];
          break;
        case 'Polygon':
        case 'MultiPolygon':
          filter = ['==', '$type', 'Polygon'];
          break;
      }
      return filter;
    }
  };

  const _addSource = (fileDetails, geojson) => {
    if (!geojson || !fileDetails) return;
    let sourceId = fileDetails.fileName;
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    });
    _addLayer(sourceId, geojson);
    _zoomToLayer(geojson);
  };

  const _zoomToLayer = geojson => {
    let bounds = bbox(geojson);
    map.fitBounds(bounds);
  };

  const _loadFile = e => {
    try {
      importer.load(e.target.files[0], _addSource);
    } catch (err) {
      console.warn(err);
    }
  };

  const Tabs = () => {
    return (
      <Flex
        sx={{
          justifyContent: 'center',
          paddingBottom: '0.5rem'
        }}
      >
        <Button
          sx={{
            width: '50%',
            bg: 'transparent',
            color: 'text',
            borderStyle: 'solid',
            borderRadius: 0,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: '.5px',
            borderBottomWidth: '0.5px',
            boxShadow: 'none',
            '&:hover': {
              bg: 'primary',
              color: 'background'
            }
          }}
          onClick={() => {
            setTab('file');
          }}
        >
          File
        </Button>

        <Button
          sx={{
            width: '50%',
            bg: 'transparent',
            color: 'text',
            borderStyle: 'solid',
            borderRadius: 0,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: '0.5px',
            boxShadow: 'none',
            '&:hover': {
              bg: 'primary',
              color: 'background'
            }
          }}
          onClick={() => {
            setTab('url');
          }}
        >
          URL
        </Button>
      </Flex>
    );
  };

  const ManageLayers = () => {
    const content = () => {
      return (
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <Link
            sx={{
              fontSize: 0
            }}
            href="#"
            onClick={e => {
              e.preventDefault();
              setTab('layers');
            }}
          >
            Manage Layers
          </Link>
        </Flex>
      );
    };
    return (
      <Box
        sx={{
          textAlign: 'center',
          marginTop: '0.5rem'
        }}
      >
        {content()}
      </Box>
    );
  };

  const FileBody = () => {
    const supportedFileExt = ['.geojson', '.kml', '.gpx', '.csv', '.zip (shp)'];
    const supported = () => {
      let title = 'Supported File Extensions:';
      let subtitle = supportedFileExt.join(', ');
      return (
        <Box>
          <Text sx={{ fontSize: 0 }}>{title}</Text>
          <Text sx={{ fontSize: 0 }}>{subtitle}</Text>
          <Input
            sx={{
              textAlign: 'center',
              paddingTop: 1,
              marginTop: 2,
              border: 'none',
              '>button': {
                boxShadow: 'none'
              }
            }}
            type="file"
            className="file-upload"
            onChange={e => {
              _loadFile(e);
            }}
          />
          {/* <Flex sx={{ justifyContent: 'flex-end' }}>
            <Button
              onClick={e => {
                _loadFile(file);
              }}
              variant="outline"
            >
              Add Data
            </Button>
          </Flex> */}
        </Box>
      );
    };
    return (
      <div>
        <Box
          sx={{
            textAlign: 'center'
          }}
        >
          {supported()}
        </Box>
        <ManageLayers />
      </div>
    );
  };

  const UrlBody = () => {
    return (
      <div>
        <Input /* fluid */ placeholder="Paste URL Here" />
        <Button
          // mt={1}
          /* fluid */
          css={{ marginTop: '0.5rem' }}
          /*           icon="files-upload" */
        >
          Add Layer
        </Button>
        <ManageLayers />
      </div>
    );
  };

  const TabBody = () => {
    return (
      <div styles={{ width: '100%' }}>
        <Tabs />
        {tab == 'file' ? <FileBody /> : <UrlBody />}
      </div>
    );
  };

  const LayerBody = () => {
    const items = () => {
      let isVisible = layerId => {
        let layerVisibility = map.getLayoutProperty(layerId, 'visibility');
        let checked = layerVisibility === 'none' ? false : true;
        return checked;
      };

      let handleChange = layerId => {
        let checked = isVisible(layerId);
        if (checked) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
        } else {
          map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
      };
      return tmpLayers.map((layerId, i) => {
        return (
          <ListItem
            key={`${layerId}-${i}`}
            /*             media={
              <Checkbox
                onChange={() => {
                  handleChange(layerId);
                }}
                defaultChecked={isVisible(layerId)}
              />
            } */
            // content={layerId}
          >
            {' '}
            <Label>
              <Checkbox
                onChange={() => {
                  handleChange(layerId);
                }}
                defaultChecked={isVisible(layerId)}
              />
              <Text pt={1}>{layerId}</Text>
            </Label>
          </ListItem>
        );
      });
    };

    return (
      <div style={{ width: '100%' }}>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setTab('file');
          }}
        >
          &lt;&lt; Back
        </a>
        <Box sx={{ marginTop: '0.5rem' }} content={<List>{items()}</List>} />
      </div>
    );
  };

  const Body = () => {
    return (
      <div style={{ width: '100%' }}>
        {tab == 'layers' ? <LayerBody /> : <TabBody />}
      </div>
    );
  };

  if (!mapExists(map)) return null;

  return (
    <BaseComponent panel={panel} sx={{ width: '300px' }}>
      <Body />
    </BaseComponent>
  );
};

export default AddData;
