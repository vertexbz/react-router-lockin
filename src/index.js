// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import Observable from 'observable-proxy';

type LockinProps = {
    lock: boolean,
    message: string,
    children: React.Node,
    renderChildren: 'locked' | 'free' | 'always'
};

type LockinContext = {
    lockin: {
        lock: boolean
    },
    router: {
        history: {
            block: () => ?() => void
        }
    }
};

type LockinState = {
    lock: boolean
};

type BeforeUnloadEvent = {
    returnValue: string
};

export default
class Lockin extends React.Component<$Shape<LockinProps>, LockinState> {
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
        }).isRequired,
        lockin: PropTypes.object
    };

    static childContextTypes = {
        router: PropTypes.shape({
            history: PropTypes.shape({
                block: PropTypes.func.isRequired
            }).isRequired
        }).isRequired,
        lockin: PropTypes.object.isRequired
    };

    static defaultProps: $Exact<LockinProps> = {
        lock: false,
        message: 'Are you sure you want to leave this page?',
        children: null,
        renderChildren: 'always'
    };

    _context = {
        lockin: new Observable({ lock: false }),
        router: {
            history: {
                block: (): void => invariant(false, 'You cannot use lock user from Lockin mounted within another\'s context')
            }
        }
    };

    _unblock = null;
    _unobserve = null;

    state = {
        lock: this.props.lock
    };

    constructor(props: LockinProps, context: LockinContext) {
        super(props, context);
        this.processProps(Lockin.defaultProps, props);
    }

    componentWillMount = () => {
        if (this.context.lockin) {
            this._unobserve = Observable.observe(this.context.lockin, 'lock', this.lockListener);
        }

        window.addEventListener('beforeunload', this._lockOnPage);
    };

    componentWillUnmount = () => {
        if (this._unobserve) {
            this._unobserve();
        }

        window.removeEventListener('beforeunload', this._lockOnPage);
        this._disable();
    };

    componentWillReceiveProps = (props: LockinProps): void => this.processProps(this.props, props);

    getChildContext = (): LockinContext => this.context.lockin ? this.context : this._context;

    lockListener = (): void => this.forceUpdate();

    processProps = (props: LockinProps, { lock, message }: LockinProps) => {
        invariant(this.context.router, 'You should not use <Lockin> outside a <Router>');

        invariant(
            !(!!this.context.lockin && this.props.lock),
            'Cannot set lock to true when in Lockin context'
        );

        if (lock && props.message !== message) {
            this._enable(message);
        }

        if (props.lock !== lock) {
            if (lock) {
                this._enable(message);
            } else {
                this._disable();
            }

            if (lock !== this.state.lock) {
                this.setState({ lock });
            }
        }
    };

    _enable = (message: ?string) => {
        if (this._unblock) this._unblock();

        this._unblock = this.context.router.history.block(message);
        this._context.lockin.lock = true;
    };

    _disable = () => {
        if (this._unblock) {
            this._unblock();
            this._unblock = null;
            this._context.lockin.lock = false;
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
        const { renderChildren, children } = this.props;

        const lock = this.context.lockin ? this.context.lockin.lock : this.state.lock;

        if (lock && renderChildren === 'free') {
            return null;
        }

        if (!lock && renderChildren === 'locked') {
            return null;
        }

        return children;
    };
}
