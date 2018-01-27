import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import Lockin from '../src/index';

const symUnblock = Symbol();

const mockContext = () => {
    const history = {
        location: {},

        listen: jest.fn(),
        block: jest.fn(),
        [symUnblock]: jest.fn()
    };
    history.block.mockReturnValue(history[symUnblock]);

    return ({
        router: {
            history
        }
    });
};

const mountWithContext = (node, context) => mount(node, { context });

const Probe = () => <div/>;

const muteErrors = (fn) => (...args) => {
    const error = console.error;
    console.error = () => undefined;

    fn(...args);

    console.error = error;
};

const getListener = (calls) => {
    for (const [event, listener] of calls) {
        if (event.toLowerCase() === 'beforeunload') {
            return listener;
        }
    }

    return null;
};

const expectationFactory = (comparator, message) => function (spy, ...args) {
    const e = {};
    const listener = getListener(spy.mock.calls);

    if (listener) {
        const result = listener(e);
        if (result === e.returnValue) {
            if (comparator(result, ...args)) {
                return { message, pass: true };
            } else {
                return { message, pass: false };
            }
        }
    }

    return { message: () => message + ' event listener malfunction', pass: !this.isNot };
};

expect.extend({
    toBeLockedOnPage: expectationFactory((value) => value !== true, 'expected user to be locked on page'),
    toBeLockedOnPageWithMessage: expectationFactory((value, message) => value === message, 'expected user to be locked on page with message'),
});

describe('React Router Lockin', () => {
    it('has propTypes defined', () => {
        expect(Lockin.propTypes.lock).toBe(PropTypes.bool);
        expect(Lockin.propTypes.message).toBe(PropTypes.string);
        expect(Lockin.propTypes.children).toBe(PropTypes.node);
        expect(typeof Lockin.propTypes.renderChildren).toBe('function');
    });

    it('throws when not in router context', () => {
        expect(muteErrors(() => {
            mount(<Lockin lock={true} renderChildren="always"/>);
        })).toThrowErrorMatchingSnapshot();
    });

    describe('supports changing lock prop', () => {
        it('locks and unlocks', () => {
            const context = mockContext();

            const spy = jest.spyOn(window, 'addEventListener');
            const wrapper = mountWithContext(<Lockin lock={true}/>, context);

            expect(wrapper).toBeTruthy();
            expect(context.router.history.block).toBeCalled();

            expect(spy).toBeLockedOnPage();

            wrapper.setProps({ lock: false });

            expect(context.router.history[symUnblock]).toBeCalled();

            expect(spy).not.toBeLockedOnPage();

            spy.mockReset();
            spy.mockRestore();
        });

        it('unlocks and locks', () => {
            const context = mockContext();

            const spy = jest.spyOn(window, 'addEventListener');
            const wrapper = mountWithContext(<Lockin lock={false}/>, context);

            expect(wrapper).toBeTruthy();
            expect(context.router.history.block).not.toBeCalled();

            expect(spy).not.toBeLockedOnPage();

            wrapper.setProps({ lock: true });

            expect(context.router.history.block).toBeCalled();

            expect(spy).toBeLockedOnPage();

            spy.mockReset();
            spy.mockRestore();
        });
    });

    describe('prop renderChildren', () => {
        describe('is always', () => {
            it('user is locked', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={true} renderChildren="always">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(true);
            });

            it('user is free', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={false} renderChildren="always">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(true);
            });
        });

        describe('is locked', () => {
            it('user is locked', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={true} renderChildren="locked">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(true);
            });

            it('user is free', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={false} renderChildren="locked">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(false);
            });
        });

        describe('is free', () => {
            it('user is locked', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={true} renderChildren="free">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(false);
            });

            it('user is free', () => {
                const context = mockContext();

                const wrapper = mountWithContext(
                    <Lockin lock={false} renderChildren="free">
                        <Probe/>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Probe).exists()).toBe(true);
            });
        });
    });

    describe('prop message is', () => {
        it('default', () => {
            const context = mockContext();

            const spy = jest.spyOn(window, 'addEventListener');
            const wrapper = mountWithContext(<Lockin lock={true}/>, context);

            expect(wrapper).toBeTruthy();
            expect(context.router.history.block).toBeCalledWith(Lockin.defaultProps.message);
            expect(spy).toBeLockedOnPageWithMessage(Lockin.defaultProps.message);

            spy.mockReset();
            spy.mockRestore();
        });

        it('custom', () => {
            const context = mockContext();
            const message = 'Leaving?';

            const spy = jest.spyOn(window, 'addEventListener');
            const wrapper = mountWithContext(<Lockin lock={true} message={message}/>, context);

            expect(wrapper).toBeTruthy();
            expect(context.router.history.block).toBeCalledWith(message);
            expect(spy).toBeLockedOnPageWithMessage(message);

            spy.mockReset();
            spy.mockRestore();
        });

        describe('changed when user is', () => {
            it('locked', () => {
                const context = mockContext();
                const message = 'Leaving?';

                const spy = jest.spyOn(window, 'addEventListener');
                const wrapper = mountWithContext(<Lockin lock={true}/>, context);

                expect(wrapper).toBeTruthy();
                expect(context.router.history.block).toBeCalledWith(Lockin.defaultProps.message);
                expect(spy).toBeLockedOnPageWithMessage(Lockin.defaultProps.message);

                wrapper.setProps({ message });
                expect(context.router.history.block).toBeCalledWith(message);
                expect(spy).toBeLockedOnPageWithMessage(message);

                spy.mockReset();
                spy.mockRestore();
            });

            it('unlocked and locked after change', () => {
                const context = mockContext();
                const message = 'Leaving?';

                const spy = jest.spyOn(window, 'addEventListener');
                const wrapper = mountWithContext(<Lockin lock={false}/>, context);

                expect(wrapper).toBeTruthy();
                expect(context.router.history.block).not.toBeCalled();
                expect(spy).not.toBeLockedOnPage();

                wrapper.setProps({ message });

                expect(context.router.history.block).not.toBeCalled();
                expect(spy).not.toBeLockedOnPage();

                wrapper.setProps({ lock: true });

                expect(context.router.history.block).toBeCalledWith(message);
                expect(spy).toBeLockedOnPageWithMessage(message);

                spy.mockReset();
                spy.mockRestore();
            });
        });
    });

    describe('nested', () => {
        describe('throws when nested lock is true', () => {
            it('since init', () => {
                expect(muteErrors(() => {
                    mountWithContext(
                        <Lockin lock={false}>
                            <Lockin lock={true} renderChildren="always"/>
                        </Lockin>,
                        mockContext()
                    );
                })).toThrowErrorMatchingSnapshot();
            });

            it('after change', () => {
                class Mock extends React.Component {
                    static contextTypes = {
                        router: PropTypes.object,
                        lockin: PropTypes.object
                    };

                    static childContextTypes = {
                        router: PropTypes.object.isRequired,
                        lockin: PropTypes.object.isRequired
                    };

                    getChildContext = () => this.context;

                    render() {
                        return (
                            <Lockin lock={false}>
                                <Lockin lock={this.props.lock} renderChildren="always"/>
                            </Lockin>
                        );
                    }
                }

                const wrapper = mountWithContext(
                    <Mock lock={false}/>,
                    mockContext()
                );

                expect(muteErrors(() => {
                    wrapper.setProps({ lock: true });
                })).toThrowErrorMatchingSnapshot();
            });
        });

        describe('renders according to renderChildren', () => {
            it('shallow', () => {
                const context = mockContext();

                const Always = () => <div/>;
                const Locked = () => <div/>;
                const Free = () => <div/>;

                const wrapper = mountWithContext(
                    <Lockin lock={false}>
                        <Lockin renderChildren="always">
                            <Always/>
                        </Lockin>
                        <Lockin renderChildren="locked">
                            <Locked/>
                        </Lockin>
                        <Lockin renderChildren="free">
                            <Free/>
                        </Lockin>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).exists()).toBe(false);
                expect(wrapper.find(Free).exists()).toBe(true);

                wrapper.setProps({ lock: true });

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).exists()).toBe(true);
                expect(wrapper.find(Free).exists()).toBe(false);

                wrapper.setProps({ lock: false });

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).exists()).toBe(false);
                expect(wrapper.find(Free).exists()).toBe(true);
            });

            it('deep', () => {
                const context = mockContext();

                const Always = () => <div/>;
                const Locked = () => <div/>;
                const Free = () => <div/>;

                const wrapper = mountWithContext(
                    <Lockin lock={false}>
                        <Lockin renderChildren="always">
                            <Lockin renderChildren="always">
                                <Always/>
                            </Lockin>
                        </Lockin>
                        <Lockin renderChildren="always">
                            <Lockin renderChildren="locked">
                                <Locked/>
                            </Lockin>
                        </Lockin>
                        <Lockin renderChildren="always">
                            <Lockin renderChildren="free">
                                <Free/>
                            </Lockin>
                        </Lockin>
                        <Lockin renderChildren="locked">
                            <Lockin renderChildren="always">
                                <Locked/>
                            </Lockin>
                        </Lockin>
                        <Lockin renderChildren="free">
                            <Lockin renderChildren="always">
                                <Free/>
                            </Lockin>
                        </Lockin>
                    </Lockin>,
                    context
                );

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).exists()).toBe(false);
                expect(wrapper.find(Free).length).toBe(2);

                wrapper.setProps({ lock: true });

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).length).toBe(2);
                expect(wrapper.find(Free).exists()).toBe(false);

                wrapper.setProps({ lock: false });

                expect(wrapper).toBeTruthy();
                expect(wrapper.find(Always).exists()).toBe(true);
                expect(wrapper.find(Locked).exists()).toBe(false);
                expect(wrapper.find(Free).length).toBe(2);
            });
        });
    });

    it('removes event handler on unmount', () => {
        const context = mockContext();

        const spy = jest.spyOn(window, 'addEventListener');
        const spy2 = jest.spyOn(window, 'removeEventListener');
        const wrapper = mountWithContext(<Lockin lock={true}/>, context);

        expect(spy).toBeCalledWith('beforeunload', expect.any(Function));
        expect(spy2).not.toBeCalledWith('beforeunload', expect.any(Function));

        expect(wrapper).toBeTruthy();
        wrapper.unmount();

        expect(spy2).toBeCalledWith('beforeunload', getListener(spy.mock.calls));

        spy.mockReset();
        spy.mockRestore();
    });
});
