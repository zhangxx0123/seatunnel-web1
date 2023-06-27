/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { h, withDirectives, VNode } from 'vue'
import {
  NSpace,
  NTooltip,
  NButton,
  NIcon,
  NPopconfirm,
  ButtonProps,
  NSwitch
} from 'naive-ui'
import { DeleteOutlined } from '@vicons/antd'
import { permission } from '@/directives/permission'
// import { usePermissionLength } from './use-permission-length'
import { COLUMN_WIDTH_CONFIG } from '@/common/column-width-config'
// import { IPermissionModule } from '@/store/user'
// import { accessTypeKey } from '@/service/resources/types'

export const useTableOperation = (
  params: {
    title: string
    key: string
    preRender?: (rowData: any, buttonVnodes: VNode[], index: number) => any
    width?: number
    noPermission?: boolean
    itemNum?: number
    buttons: {
      isDelete?: boolean
      isAuth?: boolean
      isSwitch?: boolean
      isCustom?: boolean
      isHidden?: (rowData: any) => boolean
      negativeText?: string
      positiveText?: string
      popTips?: string
      text: string | ((rowData: any) => string)
      permission?: string
      icon?: VNode | ((rowData: any) => VNode)
      auth?: any
      // accessType?: accessTypeKey
      disabled?: boolean | ((rowData: any) => boolean)
      class?: string
      value?: string | number | boolean | undefined
      checkedValue?: string | boolean | number
      uncheckedValue?: string | boolean | number
      onPositiveClick?: (rowData: any, index: number) => void
      onClick?: (rowData: any) => void
      onUpdateValue?: (value: any, rowData: any) => void
      customFunc?: (rowData: any) => VNode
    }[]
  },
  // module?: IPermissionModule
) => {
  const buttonPermissions = [] as string[]
  params.buttons.forEach((button) => {
    button.permission && buttonPermissions.push(button.permission)
  })
  let permissionLength
  if (params.noPermission) {
    permissionLength = params.buttons.length
  } else {
    // permissionLength = usePermissionLength(
    //   buttonPermissions,
    //   module || 'common'
    // )
  }

  const wrapDirective = (vNode: VNode, permissionKey?: string) => {
    return permissionKey
      ? withDirectives(vNode, [[permission, permissionKey]])
      : vNode
  }
  const getButtonVnodes = (rowData: any, index: number) => {
    // const showPopover = ref(false)
    return params.buttons
      .filter((button) => !(button.isHidden && button.isHidden(rowData)))
      .map((button) => {
        const mergedDisabled =
          typeof button.disabled === 'function'
            ? button.disabled(rowData) || rowData.isEdit === false
            : !!button.disabled || rowData.isEdit === false

        const buttonIcon =
          typeof button.icon === 'function' ? button.icon(rowData) : button.icon

        const buttonText =
          typeof button.text === 'function' ? button.text(rowData) : button.text

        const commonProps = {
          disabled: mergedDisabled,
          tag: 'div',
          circle: true,
          size: 'small',
          class: button.class
        } as ButtonProps
        if (button.isDelete) {
          return h(NTooltip, null, {
            trigger: () =>
              h(
                NPopconfirm,
                {
                  onPositiveClick: () =>
                    button.onPositiveClick
                      ? void button.onPositiveClick(rowData, index)
                      : () => {},
                  negativeText: button.negativeText,
                  positiveText: button.positiveText
                },
                {
                  trigger: () =>
                    wrapDirective(
                      h(
                        NButton,
                        {
                          ...commonProps,
                          type: 'error'
                        },
                        {
                          default: () =>
                            h(NIcon, null, {
                              default: () => button.icon || h(DeleteOutlined)
                            })
                        }
                      ),
                      params.noPermission ? '' : button.permission
                    ),
                  default: () => button.popTips
                }
              ),
            default: () => buttonText
          })
        }
        if (button.isAuth) {
          return h(button.auth, {
            ...commonProps,
            row: rowData,
            // accessType: button.accessType
          })
        }
        if (button.isSwitch) {
          return h(NTooltip, null, {
            trigger: () =>
              wrapDirective(
                h(NSwitch, {
                  value: rowData.status,
                  checkedValue: button.checkedValue,
                  uncheckedValue: button.uncheckedValue,
                  onUpdateValue: (value) =>
                    button.onUpdateValue
                      ? void button.onUpdateValue(value, rowData)
                      : () => {}
                }),
                params.noPermission ? '' : button.permission
              ),
            default: () => buttonText
          })
        }
        if (button.isCustom && button.customFunc) {
          const { customFunc } = button
          return wrapDirective(customFunc(rowData), button.permission)
        }
        return h(NTooltip, null, {
          trigger: () =>
            wrapDirective(
              h(
                NButton,
                {
                  ...commonProps,
                  type: 'info',
                  onClick: () =>
                    button.onClick ? void button.onClick(rowData) : () => {}
                },
                {
                  default: () => h(NIcon, null, { default: () => buttonIcon })
                }
              ),
              params.noPermission ? '' : button.permission
            ),
          default: () => buttonText
        })
      })
  }

  return {
    title: params.title,
    key: params.key,
    ...COLUMN_WIDTH_CONFIG['operation'](params.itemNum),
    // ...COLUMN_WIDTH_CONFIG['operation'](params.itemNum || permissionLength),
    render: (rowData: any, index: number) => {
      const buttonVnodes = getButtonVnodes(rowData, index)
      const result =
        params.preRender && params.preRender(rowData, buttonVnodes, index)
      return result === void 0
        ? h(NSpace, null, {
            default: () => buttonVnodes
          })
        : result
    }
  }
  // : {
  //     width: 0
  //   }
}
