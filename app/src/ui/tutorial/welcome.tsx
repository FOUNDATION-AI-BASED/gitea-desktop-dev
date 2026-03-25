import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'

const CodeImage = encodePathAsUrl(__dirname, 'static/code.svg')
const TeamDiscussionImage = encodePathAsUrl(
  __dirname,
  'static/github-for-teams.svg'
)
const CloudServerImage = encodePathAsUrl(
  __dirname,
  'static/github-for-business.svg'
)

export class TutorialWelcome extends React.Component {
  public render() {
    return (
      <div id="tutorial-welcome">
        <div className="header">
          <h1>Welcome to Gitea Desktop</h1>
          <p>
            Use this tutorial to get comfortable with Git, Gitea, and Gitea
            Desktop.
          </p>
        </div>
        <ul className="definitions">
          <li>
            <img src={CodeImage} alt="Html syntax icon" />
            <p>
              <strong>Git</strong> is the version control system.
            </p>
          </li>
          <li>
            <img
              src={TeamDiscussionImage}
              alt="People with discussion bubbles overhead"
            />
            <p>
              <strong>Gitea</strong> is where you store your code and
              collaborate with others (self-hosted or cloud).
            </p>
          </li>
          <li>
            <img src={CloudServerImage} alt="Server stack with cloud" />
            <p>
              <strong>Gitea Desktop</strong> helps you work with Gitea locally.
            </p>
          </li>
        </ul>
      </div>
    )
  }
}
