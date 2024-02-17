import check from "../header/assets/check.svg";
import { PAGE_LINKS } from "../modules/choose-plan-page/interactor";
import logo_new from "./assets/logo.svg";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const pathsForNewLayout = [
  "pdf_to_word",
  "pdf_to_jpg",
  "editor",
  "image_to_pdf",
  "merge-pdf",
];

export interface IProps {
  backgroundColor?: string;
}

export const Header: React.FC<IProps> = ({ backgroundColor = "#F8F8F8" }) => {
  const { t } = useTranslation();

  const isChoosingPlan = true;
  const isPaymentFormVisible = false;
  const canDownloadDoc = false;

  return (
    <div
      className="tablet:px-4 fixed mobile:static top-0 left-0 bg-[#FFFFFF] z-[505] w-full"
      style={{ backgroundColor: backgroundColor }}
    >
      <div className="max-w-[1140px] mx-auto tablet:flex items-center justify-between tablet:px-0 tablet:py-[33px] py-5 px-4">
        <div className="flex mobile:items-center items-start">
          <Link
            className="h-6 tablet:h-full tablet:mb-0 mb-5"
            href={PAGE_LINKS.MAIN}
          >
            <Image
              src={logo_new}
              alt="PDFMaster logo"
              className="w-[132px] mobile:w-[175px] h-fit"
            />
          </Link>
        </div>
        <div className="hidden mobile:block">
          <div className="flex items-center tablet:flex-nowrap flex-wrap gap-y-3">
            <div className="text-[16px] leading-[24px] text-[#575757] flex items-center">
              <Image
                src={check}
                alt="check"
                className="tablet:w-6 w-5 tablet:mr-3 mr-2"
              />
              <div>{t("payment_page.document_ready")}</div>
            </div>
            <div className="border-solid border-[0.5px] border-[#BFBFBF] h-[1px] w-[32px] mx-[13px] rounded-[16px]" />
            <div
              className={classNames(
                "text-[16px] leading-[24px] text-[#575757] flex items-center",
                { "!text-[#5F30E2]": isChoosingPlan }
              )}
            >
              {isChoosingPlan ? (
                <div
                  className="tablet:mr-3 mr-2 tablet:w-6 tablet:h-6 w-5 h-5 rounded-full bg-[#5F30E2] text-white
                  flex items-center justify-center tablet:text-[15px] tablet:leading-[18px] text-[12.5px] leading-[15px]"
                >
                  2
                </div>
              ) : (
                <Image
                  src={check}
                  alt="check"
                  className="tablet:w-6 w-5 tablet:mr-3 mr-2"
                />
              )}
              <div>{t("payment_page.select_plan")}</div>
              <div className="border-solid border-[0.5px] border-[#BFBFBF] h-[1px] w-[32px] mx-[13px] rounded-[16px]" />
            </div>

            <div
              className={classNames(
                "text-[16px] leading-[24px] text-[#575757] flex items-center",
                { "!text-[#5F30E2]": isPaymentFormVisible },
                { "!text-[#575757]": canDownloadDoc }
              )}
            >
              {canDownloadDoc ? (
                <Image
                  src={check}
                  alt="check"
                  className="tablet:w-6 w-5 tablet:mr-3 mr-2"
                />
              ) : (
                <div
                  className={classNames(
                    "tablet:mr-3 mr-2 tablet:w-6 tablet:h-6 w-5 h-5 rounded-full bg-[#F1F1F1] text-[#575757] flex items-center justify-center tablet:text-[15px] tablet:leading-[18px] text-[12.5px] leading-[15px]",
                    { "!bg-[#5F30E2] !text-white": isPaymentFormVisible }
                  )}
                >
                  3
                </div>
              )}
              <div>{t("payment_page.payment_details")}</div>
              <div className="border-solid border-[0.5px] border-[#BFBFBF] h-[1px] w-[32px] mx-[13px] rounded-[16px]" />
            </div>

            <div
              className={classNames(
                "text-[16px] leading-[24px] text-[#878787] flex items-center",
                { "!text-[#5F30E2]": canDownloadDoc }
              )}
            >
              {canDownloadDoc ? (
                <div
                  className="tablet:mr-3 mr-2 tablet:w-6 tablet:h-6 w-5 h-5 rounded-full bg-[#5F30E2] text-white
                  flex items-center justify-center tablet:text-[15px] tablet:leading-[18px] text-[12.5px] leading-[15px]"
                >
                  4
                </div>
              ) : (
                <div
                  className="tablet:mr-3 mr-2 tablet:w-6 tablet:h-6 w-5 h-5 rounded-full bg-[#F1F1F1] text-[#575757]
                  flex items-center justify-center tablet:text-[15px] tablet:leading-[18px] text-[12.5px] leading-[15px]"
                >
                  4
                </div>
              )}
              <div>{t("payment_page.download")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
