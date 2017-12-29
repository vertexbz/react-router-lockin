// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';

type LockinProps = {
    lock: boolean,
    message: string,
    children: React.Node,
    renderChildren: 'locked' | 'free' | 'always'
};

type BeforeUnloadEvent = {
    returnValue: string
};

export default
class Lockin extends React.Component<$Shape<LockinProps>> {
    static propTypes = {
        lock: PropTypes.bool,
        message: PropTypes.string,
        children: PropTypes.node,
        renderChildren: PropTypes.oneOf(['locked', 'free', 'always'])
    };

    static contextTypes = {
        router: PropTypes.shape({
            history: PropTypes.shape({
                block: PropTypes.func.isRequired
            }).isRequired
        }).isRequired
    };

    static defaultProps: $Exact<LockinProps> = {
        lock: false,
        message: 'Are you sure you want to leave this page?',
        children: null,
        renderChildren: 'always'
    };

    _unblock = null;

    constructor(props: LockinProps, context: *) {
        super(props, context);
        this.componentWillReceiveProps(props);
    }

    componentWillMount = () => {
        window.addEventListener('beforeunload', this._lockOnPage);
    };

    componentWillUnmount = () => {
        window.removeEventListener('beforeunload', this._lockOnPage);
        this._disable();
    };

    componentWillReceiveProps = ({ lock, message }: LockinProps) => {
        invariant(this.context.router, 'You should not use <Lockin> outside a <Router>');

        if (lock && this.props.message !== message) {
            this._enable(message);
        }

        if (this.props.lock !== lock) {
            if (lock) {
                this._enable(message);
            } else {
                this._disable();
            }
        }
    };

    _enable = (message) => {
        if (this._unblock) this._unblock();

        this._unblock = this.context.router.history.block(message);
    };

    _disable = () => {
        if (this._unblock) {
            this._unblock();
            this._unblock = null;
        }
    };

    _lockOnPage = (e: BeforeUnloadEvent): string | true => {
        if (this.props.lock) {
            e.returnValue = this.props.message;
            return this.props.message;
        }

        return true;
    };

    render = (): React.Node => {
        const { lock, renderChildren, children } = this.props;

        if (lock && renderChildren === 'free') {
            return null;
        }

        if (!lock && renderChildren === 'locked') {
            return null;
        }

        return children;
    };
}
