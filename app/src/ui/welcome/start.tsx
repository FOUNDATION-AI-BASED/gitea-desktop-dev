import * as React from 'react'
import { WelcomeStep } from './welcome'
import { LinkButton } from '../lib/link-button'
import { Dispatcher } from '../dispatcher'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'
import { Loading } from '../lib/loading'
import { BrowserRedirectMessage } from '../lib/authentication-form'
import { SamplesURL } from '../../lib/stats'

interface IStartProps {
  readonly advance: (step: WelcomeStep) => void
  readonly dispatcher: Dispatcher
  readonly loadingBrowserAuth: boolean
}

/** The first step of the Welcome flow. */
export class Start extends React.Component<IStartProps, {}> {
  public render() {
    return (
      <section
        id="start"
        aria-label="Welcome to Gitea Desktop"
        aria-describedby="start-description"
      >
        <div className="start-content">
          <h1 className="welcome-title">
            Welcome to <span>Gitea Desktop</span>
          </h1>
          {!this.props.loadingBrowserAuth ? (
            <>
              <p id="start-description" className="welcome-text">
                Gitea Desktop is a seamless way to contribute to projects on
                your self-hosted Gitea instance. Sign in below to get started.
              </p>
            </>
          ) : (
            <p>{BrowserRedirectMessage}</p>
          )}

          <div className="welcome-main-buttons">
            <Button
              type="submit"
              className="button-with-icon"
              disabled={this.props.loadingBrowserAuth}
              onClick={this.signInToGitea}
              autoFocus={true}
              role="link"
            >
              {this.props.loadingBrowserAuth ? (
                <Loading />
              ) : (
                <>
                  Sign in to Gitea
                  <Octicon symbol={octicons.linkExternal} />
                </>
              )}
            </Button>
            {this.props.loadingBrowserAuth && (
              <Button onClick={this.cancelBrowserAuth}>Cancel</Button>
            )}
          </div>
          <div className="skip-action-container">
            <LinkButton className="skip-button" onClick={this.skip}>
              Skip this step
            </LinkButton>
          </div>
        </div>

        <div className="start-footer">
          <p>
            Gitea Desktop sends usage metrics to improve the product.{' '}
            <LinkButton uri={SamplesURL}>
              Learn more about user metrics.
            </LinkButton>
          </p>
        </div>
      </section>
    )
  }

  private signInToGitea = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
    }

    this.props.advance(WelcomeStep.SignInToEnterprise)
  }

  private cancelBrowserAuth = () => {
    this.props.advance(WelcomeStep.Start)
  }

  private skip = () => {
    this.props.advance(WelcomeStep.ConfigureGit)
  }
}
