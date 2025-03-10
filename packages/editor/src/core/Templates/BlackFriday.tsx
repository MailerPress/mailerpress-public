import {registerTemplate} from "../regisetBlockType.ts";

registerTemplate({
    name: "Black fridat",
    category: "core/e-shop",
    template: () => `
<mjml>
  <mj-head>
    <mj-title>Discount Light</mj-title>
    <mj-preview>Pre-header Text</mj-preview>
<!--    <mj-attributes>-->
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-text>
    </mj-attributes>
    <mj-style inline="inline">
      .body-section {
      -webkit-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      -moz-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      }
    </mj-style>
    <mj-style inline="inline">
      .text-link {
      color: #5e6ebf
      }
    </mj-style>
    <mj-style inline="inline">
      .footer-link {
      color: #888888
      }
    </mj-style>

  </mj-head>
  <mj-body background-color="#E7E7E7" width="600px">
    <mj-section full-width="full-width" background-color="#040B4F" padding-bottom="0">
      <mj-column width="100%">
        <mj-image src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544153577/Email/Images/AnnouncementOffset/crofts-white.png" alt="" align="center" width="150px" />
        <mj-text color="#ffffff" font-weight="bold" align="center" text-transform="uppercase" font-size="16px" letter-spacing="1px" padding-top="30px">
          Austin, TX
          <br />
          <span style="color: #979797; font-weight: normal">-</span>
        </mj-text>
        <mj-text color="#17CBC4" align="center" font-size="13px" padding-top="0" font-weight="bold" text-transform="uppercase" letter-spacing="1px" line-height="20px">
          Austin Convention Center
          <br />
          123 Main Street, 78701
        </mj-text>
        <mj-image src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544156968/Email/Images/AnnouncementOffset/header-top.png" width="600px" alt="" padding="0" href="https://google.com" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#1f2e78">
      <mj-column width="100%">
        <mj-image src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544156968/Email/Images/AnnouncementOffset/header-bottom.png" width="600px" alt="" padding="0" href="https://google.com" />
      </mj-column>
    </mj-section>
    <mj-wrapper padding-top="0" padding-bottom="0" css-class="body-section">
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
        <mj-column width="100%">
          <mj-text color="#212b35" font-weight="bold" font-size="20px">
            Croft's in Austin is opening December 20th
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            Hi Jane,
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quia a assumenda nulla in quisquam optio quibusdam fugiat perspiciatis nobis, ad tempora culpa porro labore. Repudiandae accusamus obcaecati voluptatibus accusantium perspiciatis.
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            Tempora culpa porro labore. Repudiandae accusamus obcaecati voluptatibus accusantium perspiciatis:
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            <ul>
              <li style="padding-bottom: 20px"><strong>Lorem ipsum dolor:</strong> Sit amet consectetur adipisicing elit.</li>
              <li style="padding-bottom: 20px"><strong>Quia a assumenda nulla:</strong> Repudiandae accusamus obcaecati voluptatibus accusantium perspiciatis.</li>
              <li><strong>Tempora culpa porro labore:</strong> In quisquam optio quibusdam fugiat perspiciatis nobis.</li>
            </ul>
          </mj-text>
          <mj-text color="#637381" font-size="16px" padding-bottom="30px">
            Lorem ipsum dolor <a class="text-link" href="https://google.com">sit amet consectetur</a> adipisicing elit. Earum eaque sunt nulla in, id eveniet quae unde ad ipsam ut, harum autem porro reiciendis minus libero illo. Vero, fugiat reprehenderit.
          </mj-text>
          <mj-button background-color="#5e6ebf" align="center" color="#ffffff" font-size="17px" font-weight="bold" href="https://google.com" width="300px">
            RSVP Today
          </mj-button>
          <mj-button background-color="#5e6ebf" align="center" color="#ffffff" font-size="17px" font-weight="bold" href="https://google.com" width="300px">
            Book an Appointment
          </mj-button>
          <mj-text color="#637381" font-size="16px" padding-top="30px">
            Lorem ipsum dolor <a class="text-link" href="https://google.com">sit amet consectetur</a> adipisicing elit. Earum eaque sunt nulla in, id eveniet quae unde ad ipsam ut, harum autem porro reiciendis minus libero illo. Vero, fugiat reprehenderit.
          </mj-text>
          <mj-text color="#637381" font-size="16px" padding-bottom="0">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px" padding-top="0">
        <mj-column width="50%">
          <mj-image align="center" src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544153577/Email/Images/AnnouncementOffset/Image_1.png" alt="" />
        </mj-column>
        <mj-column width="50%">
          <mj-image align="center" src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544153578/Email/Images/AnnouncementOffset/Image_2.png" alt="" />
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px" padding-top="0">
        <mj-column width="100%">
          <mj-divider border-color="#DFE3E8" border-width="1px" />
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" padding="0 15px 0 15px">
        <mj-column width="100%">
          <mj-text color="#212b35" font-weight="bold" font-size="20px" padding-bottom="0">
            Come see us!
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            We're looking forward to meeting you.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
        <mj-column width="50%">
          <mj-text color="#212b35" font-size="12px" text-transform="uppercase" font-weight="bold" padding-bottom="0">
            address
          </mj-text>
          <mj-text color="#637381" font-size="14px" padding-top="0">
            Austin Convention Center
            <br />
            123 Main Street, 78701
          </mj-text>
        </mj-column>
        <mj-column width="50%">
          <mj-text color="#212b35" font-size="12px" text-transform="uppercase" font-weight="bold" padding-bottom="0">
            Hours of Operation
          </mj-text>
          <mj-text color="#637381" font-size="14px" padding-top="0">
            Monday, December 20th: 8:00AM - 5:00PM
            <br />
            Tuesday, December 21st: 8:00AM - 5:00PM
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
        <mj-column width="100%">
          <mj-image src="https://res.cloudinary.com/dheck1ubc/image/upload/v1544153579/Email/Images/AnnouncementOffset/map.jpg" alt="" />
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <mj-wrapper full-width="full-width">
      <mj-section>
        <mj-column width="100%" padding="0">
          <mj-text color="#445566" font-size="11px" font-weight="bold" align="center">
            View this email in your browser
          </mj-text>
          <mj-text color="#445566" font-size="11px" align="center" line-height="16px">
            You are receiving this email advertisement because you registered with Croft's Accountants. (123 Main Street, Austin, TX 78701) and agreed to receive emails from us regarding new features, events and special offers.
          </mj-text>
          <mj-text color="#445566" font-size="11px" align="center" line-height="16px">
            &copy; Croft's Accountants Inc., All Rights Reserved.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding-top="0">
        <mj-group>
          <mj-column width="100%" padding-right="0">
            <mj-text color="#445566" font-size="11px" align="center" line-height="16px" font-weight="bold">
              <a class="footer-link" href="https://www.google.com">Privacy</a>&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;<a class="footer-link" href="https://www.google.com">Unsubscribe</a>
            </mj-text>
          </mj-column>
        </mj-group>

      </mj-section>
    </mj-wrapper>

  </mj-body>
</mjml>
    `
})