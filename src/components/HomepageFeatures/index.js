import React from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'Understand why things happened',
    Svg: require('@site/static/img/history.svg').default,
    description: (
      <>
        With OpsChain's reporting and tracking features – as well as a Git-based workflow – understand how and why changes happen in your computing environment.
      </>
    ),
  },
  {
    title: 'Unify your tools and view of change',
    Svg: require('@site/static/img/unify.svg').default,
    description: (
      <>
        Track change across your different deployment tools by bringing them together for a better automation experience with OpsChain.
      </>
    ),
  },
  {
    title: 'Ready to be extended',
    Svg: require('@site/static/img/extend.svg').default,
    description: (
      <>
        Built API-first to integrated-with and be extended-by your existing tools and processes. Create your own extensions to make OpsChain more powerful.
      </>
    ),
  },
]

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
