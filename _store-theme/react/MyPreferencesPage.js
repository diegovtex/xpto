import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'
import MyPreferences from './components/MyPreferences'

const MyPreferencesPage = () => (
  <Fragment>
    <Route exact path="/preferences" component={MyPreferences} />
  </Fragment>
)

export default MyPreferencesPage
