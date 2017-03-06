import React, { PropTypes } from 'react'
import _ from 'lodash'
import CollectionTile from './CollectionTileComponent'
import styles from './collectionGrid.css'

class CollectionGrid extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const cards = []
    _.forOwn(this.props.results, (val, key) => {
      cards.push(<CollectionTile
            key={key}
            title={val.title}
            thumbnail={val.thumbnail}
            description={val.description}
            geometry={val.spatialBounding}
            onCardClick={() => this.props.onCardClick(key)}
        />)
    })
    return <div>
      <div>
        Showing {this.props.returnedHits} of {this.props.totalHits} matching results
      </div>
      <div className={styles.gridWrapper}>
        {cards}
      </div>
      <button className={styles.showMoreButton} onClick={() => this.props.fetchMoreResults()}>Show More Results</button>
    </div>
  }
}

export default CollectionGrid
