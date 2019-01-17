import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import { isProfileRoute } from '../../utils/globals';
import getVendors from '../../utils/getVendors';
import Spinner from '../../components/Spinner';
import Items from '../../components/Items';
import Tooltip from '../../components/Tooltip';

import './styles.css';

class Vendors extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    if (!this.props.vendors) {
      getVendors();
    }
  }

  render() {
    const { t, manifest, vendors } = this.props;

    if (vendors) {
      const vendorHash = this.props.match.params.hash ? this.props.match.params.hash : '3361454721';
      const vendorDefinition = manifest.DestinyVendorDefinition[vendorHash];

      // displayCategories object
      let displayCategories = {};

      Object.values(vendors[vendorHash].Response.sales.data).forEach(item => {
        // find categoryIndex of sales item
        let displayCategoryIndex = vendors[vendorHash].Response.categories.data.categories.find(category => category.itemIndexes.includes(item.vendorItemIndex)).displayCategoryIndex;

        // banshee 'armour'
        if (vendorHash === '672118013' && vendorDefinition.displayCategories[displayCategoryIndex].displayCategoryHash === 3960628832) {
          return;
        }

        // tess bs
        let displayCategoryHashes = [1233992729, 291525618, 607688504];
        if (vendorHash === '3361454721' && displayCategoryHashes.includes(vendorDefinition.displayCategories[displayCategoryIndex].displayCategoryHash)) {
          return;
        }

        if (!displayCategories[displayCategoryIndex]) {
          displayCategories[displayCategoryIndex] = {
            identifier: vendorDefinition.displayCategories[displayCategoryIndex].identifier,
            displayProperties: {
              name: vendorDefinition.displayCategories[displayCategoryIndex].displayProperties.name
            },
            items: []
          };
        }

        // add item to displayCategories object
        displayCategories[displayCategoryIndex].items.push(item);
      });

      let output = Object.values(displayCategories).map(category => {
        if (category.items) {
          return (
            <div key={category.displayProperties.name} className='category'>
              <div className='sub-header sub'>
                <div>{category.displayProperties.name}</div>
              </div>
              <ul className='list items'>
                <Items hashes={category.items.map(item => item.itemHash)} manifest={manifest} />
              </ul>
            </div>
          );
        } else {
          return null;
        }
      });

      return (
        <>
          <div className={cx('view', this.props.theme.selected, { 'profile-route': isProfileRoute('/vendors', this.props.profile.data) })} id='vendors'>
            <div className='pane'>
              <div className='header'>
                <div className='sub-header sub'>
                  <div>{t('Vendors')}</div>
                </div>
                <div className='description'>{t("The data driving this content is based on the developers' own character's progression and may result in visual discrepancies. It is updated every 4 hours daily and for the most part is accurate.")}</div>
              </div>
              <div className='display'>
                <div className='name'>{vendorDefinition.displayProperties.name}</div>
                <div className='description'>{vendorDefinition.displayProperties.description}</div>
              </div>
              <div className='inventories'>
                <ul className='list'>
                  {Object.values(vendors).map(vendor => {
                    if (vendor.ErrorCode === 1) {
                      let vendorDefinition = manifest.DestinyVendorDefinition[vendor.Response.vendor.data.vendorHash];
                      let isActive = (match, location) => {
                        if (!this.props.match.params.hash && vendorDefinition.hash === 3361454721) {
                          return true;
                        } else if (match) {
                          return true;
                        } else {
                          return false;
                        }
                      };
                      return (
                        <li key={`nav-${vendorDefinition.hash}`} className='linked'>
                          <NavLink isActive={isActive} to={`/vendors/${vendorDefinition.hash}`} exact>
                            {vendorDefinition.displayProperties.name}
                          </NavLink>
                        </li>
                      );
                    } else {
                      return null;
                    }
                  })}
                </ul>
              </div>
            </div>
            <div className='items'>{output}</div>
          </div>
          <Tooltip manifest={manifest} />
        </>
      );
    } else {
      return (
        <div className={cx('view', this.props.theme.selected, { 'profile-route': isProfileRoute('/vendors', this.props.profile.data) })} id='vendors'>
          <div className='pane'>
            <div className='header'>
              <div className='sub-header sub'>
                <div>{t('Vendors')}</div>
              </div>
              <div className='description'>{t("The data driving this content is bassed on the developers' own character's progression and may result in visual discrepancies. It is updated every 4 hours daily and for the most part is accurate.")}</div>
            </div>
            <div className='inventories'>
              <Spinner />
            </div>
          </div>
          <div className='items'>
            <Spinner />
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    vendors: state.vendors,
    profile: state.profile,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Vendors);
