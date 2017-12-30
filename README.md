# react-router-lockin

React Router addon for locking user in current page.

## Props

| Name               | Type                            | Default                                     | Required | description                                       |
|--------------------|---------------------------------|---------------------------------------------|----------|---------------------------------------------------|
| **lock**           | `boolean`                       | `false`                                     | No       | Whether to lock user on current page              |
| **message**        | `string`                        | `Are you sure you want to leave this page?` | No       | Message displayed to user before leaving the page |
| **renderChildren** | `always` or `locked` or  `free` | `always`                                    | No       | When should render components children            |
| **children**       | `node`                          | `null`                                      | No       | Children                                          |

## Example

```jsx
<Lockin lock />
```

---

There is also fully working example in `example/index.js`

Run with webpack dev server at 8080: `yarn start` or `npm start`

