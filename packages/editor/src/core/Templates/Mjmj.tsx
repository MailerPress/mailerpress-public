import {registerTemplate} from "../regisetBlockType.ts";

registerTemplate({
    name: "MJML template",
    category: "core/newsletter",
    template: () => `
<mjml>
  <mj-body background-color="#d7dde5">
    <mj-section full-width="full-width">
      <mj-column width="66.66666666666666%" vertical-align="middle">
        <mj-text align="left" font-size="11px" padding-bottom="0px" padding-top="0"><span style="font-size: 11px">[[HEADLINE]]</span></mj-text>
      </mj-column>
      <mj-column width="33.33333333333333%" vertical-align="middle">
        <mj-text align="right" font-size="11px" padding-bottom="0px" padding-top="0"><span style="font-size: 11px"><a href="https://mjml.io" style="text-decoration: none; color: inherit;">[[PERMALINK_LABEL]]</a></span></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" full-width="full-width">
      <mj-column width="33.33333333333333%" vertical-align="middle">
        <mj-image src="http://191n.mj.am/img/191n/1t/hx.png" alt="OnePage" padding-bottom="0px" padding-top="10px"></mj-image>
      </mj-column>
      <mj-column width="66.66666666666666%" vertical-align="middle">
        <mj-text align="center" padding-bottom="0px" padding-top="10px"><a href="https://mjml.io" style="text-decoration: none; color: inherit;">Home</a>&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;<a href="https://mjml.io" style="text-decoration: none; color: inherit;">Features</a>&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;
          <a href="https://mjml.io" style="text-decoration: none; color: inherit;">Portfolio</a>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-url="http://191n.mj.am/img/191n/1t/h0.jpg" vertical-align="middle" background-size="cover" full-width="full-width" background-repeat="no-repeat">
      <mj-column width="100%" vertical-align="middle">
        <mj-text align="center" font-size="14px" color="#45474e" padding-bottom="10px" padding-top="45px"><span style="font-size: 30px; line-height: 30px;">More than an email template</span><br /><br />Only on <span style="color: #e85034">Mailjet</span> template builder</mj-text>
        <mj-button align="center" background-color="#e85034" color="#fff" border-radius="24px" href="https://mjml.io" font-family="Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif" padding-bottom="45px" padding-top="10px">SUBSCRIBE</mj-button>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" vertical-align="top" full-width="full-width">
      <mj-column vertical-align="top" width="33.33333333333333%">
        <mj-image src="http://191n.mj.am/img/191n/1t/hs.png" alt="" width="50px"></mj-image>
        <mj-text align="center" color="#9da3a3" font-size="11px" padding-bottom="30px"><span style="font-size: 14px; color: #e85034">Best audience</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</mj-text>
      </mj-column>
      <mj-column vertical-align="top" width="33.33333333333333%">
        <mj-image src="http://191n.mj.am/img/191n/1t/hm.png" alt="" width="50px"></mj-image>
        <mj-text align="center" color="#9da3a3" font-size="11px" padding-bottom="30px"><span style="font-size: 14px; color: #e85034">Higher rates</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</mj-text>
      </mj-column>
      <mj-column vertical-align="top" width="33.33333333333333%">
        <mj-image src="http://191n.mj.am/img/191n/1t/hl.png" alt="" width="50px"></mj-image>
        <mj-text align="center" color="#9da3a3" font-size="11px" padding-bottom="30px" padding-top="3px"><span style="font-size: 14px; color: #e85034">24/7 Support</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#e85034" vertical-align="middle" full-width="full-width">
      <mj-column width="100%" vertical-align="middle">
        <mj-text align="center" color="#ffffff" font-size="18px" padding-bottom="10px">Why choose us?</mj-text>
        <mj-divider border-color="#fff" border-style="solid" border-width="1px" padding-left="100px" padding-right="100px" padding-bottom="20px" padding-top="20px"></mj-divider>
        <mj-text align="center" color="#f8d5d1" font-size="11px" padding-bottom="25px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section vertical-align="middle" background-color="#ffffff" full-width="full-width">
      <mj-column width="50%" vertical-align="middle">
        <mj-image src="http://191n.mj.am/img/191n/1t/h2.jpg" alt="" padding-bottom="20px" padding-top="20px"></mj-image>
      </mj-column>
      <mj-column width="50%" vertical-align="middle">
        <mj-text align="left" color="#9da3a3" font-size="11px" padding-bottom="25px" padding-top="25px"><span style="font-weight: bold; font-size: 14px; color: #45474e">Great newsletter for the best company out there</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam.</mj-text>
        <mj-button align="left" background-color="#e85034" color="#fff" border-radius="24px" font-size="11px" href="https://mjml.io" font-family="Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif" padding-bottom="45px" padding-top="10px">READ MORE</mj-button>
      </mj-column>
    </mj-section>
    <mj-section full-width="full-width">
      <mj-column width="100%" vertical-align="middle">
        <mj-text align="center" font-size="11px" padding-bottom="0px" padding-top="0px">
          <p style="font-size: 11px">[[DELIVERY_INFO]]</p>
        </mj-text>
        <mj-text align="center" font-size="11px" padding-bottom="0px" padding-top="0px">
          <p style="font-size: 11px">[[POSTAL_ADDRESS]]</p>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
    `
})
