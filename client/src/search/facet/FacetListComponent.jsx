import React from 'react'
import styles from './facet.css'
import _ from 'lodash'
import Collapse, { Panel } from 'rc-collapse'

class FacetList extends React.Component {
  constructor(props) {
    super(props)
    this.updateAndSubmitSearch = this.updateAndSubmitSearch.bind(this)
    this.categories = props.categories
    this.updateFacets = props.updateFacets
    this.submit = props.submit
  }

  updateAndSubmitSearch(e) {
    const {name, value} = e.target.dataset
    const selected = e.target.checked
    const facet = {
      name,
      value,
      selected
    }
    this.updateFacets(facet)
    this.submit()
  }

  toTitleCase(str){
    return _.startCase(_.toLower((str.split(/(?=[A-Z])/).join(" "))))
  }

  subFacetLabel(str) {
    return str.split('>').pop().trim()
  }

  render() {
    let facets = []
    let self = this
    let i = 0, j = 0
    _.forOwn(this.categories, function(v,k){
      facets.push(
        <Panel header={`${self.toTitleCase(k)}`} key={`${i++}`}>
          {v.map((obj)=> {
            return(<div>
              <input className={styles.checkFacet} data-name={`${k}`} data-value={`${obj.term}`} id={`${k}-${obj.term}`} type="checkbox"
               onChange={self.updateAndSubmitSearch}/><span className={styles.facetLabel}>{self.subFacetLabel(`${obj.term}`)}</span>
              <div className={`${styles.count} ${styles.numberCircle}`}>{`(${obj.count})`}</div>
            </div>)
          })}
        </Panel>
      )
    })

    return <div>
      <div className={`${styles.facetContainer}`}>
        <form class="pure-form">
          <span className={'pure-menu-heading'}>Facets</span>
          <Collapse defaultActiveKey="0">
            {facets}
          </Collapse>
        </form>
      </div>
    </div>
  }

}
export default FacetList
