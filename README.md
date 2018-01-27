# react-router-lockin

React Router addon for locking user in current page.
It also lets you display content depends whether user is locked on page or not. See last example.

## Props

| Name               | Type                            | Default                                     | Required | description                                       |
|--------------------|---------------------------------|---------------------------------------------|----------|---------------------------------------------------|
| **lock**           | `boolean`                       | `false`                                     | No       | Whether to lock user on current page              |
| **message**        | `string`                        | `Are you sure you want to leave this page?` | No       | Message displayed to user before leaving the page |
| **renderChildren** | `always` or `locked` or  `free` | `always`                                    | No       | When should render components children            |
| **children**       | `node`                          | `null`                                      | No       | Children                                          |

## Example

```js
import * as React from 'react';
import Lockin from 'react-router-lockin';


const Page = () => (
    <div>
        <Lockin lock />
    </div>
);


const Page = () => (
    <div>
        <Lockin lock={false} message="Want to leave?" />
    </div>
);

const Page = () => (
    <div>
        <Lockin lock={true} message="Want to leave?" renderChildren="locked">
            This is rendered when lock is true
        </Lockin>
    </div>
);

const Page = () => (
    <div>
        <Lockin lock={true} message="Want to leave?" renderChildren="free">
            This is rendered when lock is false
        </Lockin>
    </div>
);


const Page = () => (
    <div>
        <Lockin lock={true} message="Want to leave?">
            <Lockin renderChildren="free">
                This is rendered when lock is false
            </Lockin>
            <Lockin renderChildren="locked">
                This is rendered when lock is true
            </Lockin>
        </Lockin>
    </div>
);

```

---

There is also fully working example in `example/index.js`

Run with webpack dev server at 8080: `yarn start` or `npm start`

