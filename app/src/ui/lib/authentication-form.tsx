import * as React from 'react'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Form } from './form'
import { Button } from './button'
import { TextBox } from './text-box'
import { Loading } from './loading'
import { LinkButton } from './link-button'
import { Dialog, DialogContent, DefaultDialogFooter } from '../dialog'

/** Text to let the user know their browser will send them back to Gitea Desktop */
export const BrowserRedirectMessage =
  "Your browser will redirect you back to Gitea Desktop once you've signed in. If your browser asks for your permission to launch Gitea Desktop please allow it."

interface IAuthenticationFormProps {
  readonly onBrowserSignInRequested: () => void
  readonly onTokenSignInRequested?: (token: string) => void
  readonly loading?: boolean
  readonly additionalButtons?: ReadonlyArray<JSX.Element>
}

interface IAuthenticationFormState {
  readonly token: string
  readonly useToken: boolean
  readonly showInstructions: boolean
}

/** The Gitea authentication component. */
export class AuthenticationForm extends React.Component<
  IAuthenticationFormProps,
  IAuthenticationFormState
> {
  public constructor(props: IAuthenticationFormProps) {
    super(props)
    this.state = { token: '', useToken: false, showInstructions: false }
  }

  public render() {
    return (
      <>
        <Form className="sign-in-form" onSubmit={this.onSubmit}>
          {this.state.useToken
            ? this.renderTokenAuth()
            : this.renderBrowserAuth()}
          <div className="sign-in-instructions-link">
            <LinkButton onClick={this.showInstructions}>
              How do I sign in?
            </LinkButton>
          </div>
        </Form>
        {this.state.showInstructions && (
          <SignInInstructionsDialog
            onDismissed={() => this.setState({ showInstructions: false })}
          />
        )}
      </>
    )
  }

  private showInstructions = () => {
    this.setState({ showInstructions: true })
  }

  private renderTokenAuth() {
    return (
      <>
        <TextBox
          label="Personal Access Token"
          type="password"
          autoFocus={true}
          disabled={this.props.loading}
          value={this.state.token}
          onValueChanged={token => this.setState({ token })}
          placeholder="Paste your token from Gitea Settings → Applications"
        />
        <div className="actions">
          <Button
            type="submit"
            disabled={!this.state.token.length || this.props.loading}
          >
            {this.props.loading ? <Loading /> : null} Sign in with token
          </Button>
          <Button
            type="button"
            onClick={() => this.setState({ useToken: false, token: '' })}
          >
            Use browser instead
          </Button>
          {this.props.additionalButtons}
        </div>
      </>
    )
  }

  private renderBrowserAuth() {
    return (
      <>
        {BrowserRedirectMessage}
        <Button
          type="button"
          className="button-with-icon"
          onClick={this.signInWithBrowser}
          autoFocus={true}
          role="link"
        >
          Sign in using your browser
          <Octicon symbol={octicons.linkExternal} />
        </Button>
        <Button
          type="button"
          onClick={() => this.setState({ useToken: true })}
        >
          Or sign in with Personal Access Token
        </Button>
        {this.props.additionalButtons}
      </>
    )
  }

  private onSubmit = (event?: React.FormEvent) => {
    event?.preventDefault()
    if (this.state.useToken && this.state.token && this.props.onTokenSignInRequested) {
      this.props.onTokenSignInRequested(this.state.token)
    } else if (!this.state.useToken) {
      this.signInWithBrowser()
    }
  }

  private signInWithBrowser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    this.props.onBrowserSignInRequested()
  }
}

interface ISignInInstructionsDialogProps {
  readonly onDismissed: () => void
}

function SignInInstructionsDialog({
  onDismissed,
}: ISignInInstructionsDialogProps) {
  return (
    <Dialog
      title={__DARWIN__ ? 'Sign-in Instructions' : 'Sign-in instructions'}
      onDismissed={onDismissed}
      onSubmit={onDismissed}
    >
      <DialogContent>
        <div className="sign-in-instructions">
          <h3>Option 1: Personal Access Token (recommended)</h3>
          <ol>
            <li>Open your Gitea instance in a browser</li>
            <li>Go to <strong>Settings</strong> → <strong>Applications</strong> → <strong>Generate New Token</strong></li>
            <li>Give the token a name (e.g. &quot;Gitea Desktop&quot;) and select the scopes you need</li>
            <li>Click <strong>Generate Token</strong> and copy the token</li>
            <li>Paste the token in the sign-in form above</li>
          </ol>

          <h3>Option 2: Sign in with browser (OAuth)</h3>
          <p>
            For OAuth sign-in, an administrator must create an OAuth2 application
            in your Gitea instance:
          </p>
          <ol>
            <li>Go to <strong>Settings</strong> → <strong>Applications</strong> → <strong>Create OAuth2 Application</strong></li>
            <li>Set the redirect URI to: <code>x-gitea-desktop-auth://oauth</code></li>
            <li>Configure the application and note the Client ID and Client Secret</li>
            <li>Set <code>DESKTOP_OAUTH_CLIENT_ID</code> and <code>DESKTOP_OAUTH_SECRET</code> when building Gitea Desktop</li>
          </ol>
          <p>
            If OAuth is not set up, use the Personal Access Token method above.
          </p>
        </div>
      </DialogContent>
      <DefaultDialogFooter buttonText="Got it" />
    </Dialog>
  )
}
