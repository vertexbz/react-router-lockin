import React  from 'react';
import ReactDOM  from 'react-dom';
import { BrowserRouter, Link } from 'react-router-dom';
import Lockin from 'react-router-lockin';

class LockWithState extends React.Component {
    state = {
        lock: false,
        message: 'Wanna leave?',
        render: 'always'
    };

    render = () => (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>Lock</td>
                        <td>
                            <input type="checkbox" checked={this.state.lock} onChange={(e) => this.setState({ lock: e.target.checked })} />
                        </td>
                    </tr>
                    <tr>
                        <td>Message</td>
                        <td>
                            <input value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} />
                        </td>
                    </tr>
                    <tr>
                        <td>Render children</td>
                        <td>
                            {['always', 'locked', 'free'].map((state) => (
                                <label key={state}>
                                    <input type="radio" checked={this.state.render === state} onChange={(e) => this.setState({ render: state })} />
                                    {state}
                                </label>
                            ))}
                        </td>
                    </tr>
                </tbody>
            </table>

            <Lockin lock={this.state.lock} message={this.state.message}>
                {[0, 1, 2, 4, 5].map((n) => (
                    <div key={n} style={{ padding: 5, backgroundColor: 'orange', height: 32, fontWeight: 'bold', margin: 5 }}>
                        <Lockin renderChildren={this.state.render}>
                            <div style={{ padding: 5, backgroundColor: 'yellow', height: 22, fontWeight: 'bold' }}>
                                #{n+1} Child Lockin&apos;s content
                            </div>
                        </Lockin>
                    </div>
                ))}
            </Lockin>

            <Link to={`/${Number(Math.random().toString().replace('0.',  '')).toString(16)}`}>Go to another address</Link>
        </div>
    );
}

const App = () => (
    <BrowserRouter>
        <LockWithState />
    </BrowserRouter>
);

window.onload = () => {
    const root = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(root);

    ReactDOM.render(<App />, root);
};
