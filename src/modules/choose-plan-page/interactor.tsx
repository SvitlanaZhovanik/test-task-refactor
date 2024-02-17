// import { EDIT_FILENAME_LC_KEY, EDIT_FILE_LC_KEY } from '@/common/constants'
import { useRemoteConfig } from "../../providers/remote-config-provider";
import { useUser } from "../../providers/user-provider";
import { API } from "../../services/api";
import { ApiFile } from "../../services/api/types";
import { generatePDFCover } from "../../use-cases/generate-pdf-cover";
import {
  PaymentPlanId,
  useGetSubscriptionProducts,
} from "../../use-cases/get-subscription-products";
import check from "./assets/check.svg";
import cross from "./assets/cross.svg";
import { useRouter } from "next/router";
import React from "react";

export enum PAGE_LINKS {
  MAIN = "/",
  PAYMENT = "/payment",
  DASHBOARD = "/dashboard",
}

export enum InternalFileType {
  DOC = "DOC",
  DOCX = "DOCX",
  JPEG = "JPEG",
  JPG = "JPG",
  HEIC = "HEIC",
  HEIF = "HEIF",
  PDF = "PDF",
  PNG = "PNG",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  ZIP = "ZIP",
  BMP = "BMP",
  EPS = "EPS",
  GIF = "GIF",
  SVG = "SVG",
  TIFF = "TIFF",
  WEBP = "WEBP",
  EPUB = "EPUB",
}

export const imagesFormat = [
  InternalFileType.HEIC,
  InternalFileType.SVG,
  InternalFileType.PNG,
  InternalFileType.BMP,
  InternalFileType.EPS,
  InternalFileType.GIF,
  InternalFileType.TIFF,
  InternalFileType.WEBP,
  InternalFileType.JPG,
  InternalFileType.JPEG,
];

export type Bullets = {
  imgSrc: string;
  bullText: JSX.Element;
};

export interface Plan {
  id: PaymentPlanId;
  title: string;
  price: string;
  date: string | null;
  bullets: Bullets[];
  bulletsC?: Bullets[];
  text: string | JSX.Element;
  formattedCurrency?: string;
  fullPrice?: string;
}

export interface IPaymentPageInteractor {
  selectedPlan: PaymentPlanId;
  onSelectPlan: (plan: PaymentPlanId) => void;
  onContinue: (place?: string) => void;
  onCommentsFlip: () => void;

  imagePDF: Blob | null;
  isImageLoading: boolean;
  fileType: string | null;
  fileLink: string | null;

  isEditorFlow: boolean;
  isSecondEmail: boolean;
  isThirdEmail: boolean;

  isRemoteConfigLoading: boolean;
  fileName: string | null;

  getPlans: (t: (key: string) => string) => Plan[];
  isPlansLoading: boolean;
}

export const usePaymentPageInteractor = (): IPaymentPageInteractor => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState<PaymentPlanId>(
    PaymentPlanId.MONTHLY_FULL
  );
  const { products } = useGetSubscriptionProducts();
  const { user } = useUser();

  const [file, setFile] = React.useState<ApiFile>();
  const [imagePDF, setImagePDF] = React.useState<Blob | null>(null);
  const [isImageLoading, setIsImageLoading] = React.useState(false);
  const [fileLink, setFileLink] = React.useState<string | null>(null);

  const { abTests, isRemoteConfigLoading } = useRemoteConfig();

  const onCommentsFlip = () => {
    console.log("send event analytic0");
  };

  const onSelectPlan = (plan: PaymentPlanId) => {
    if (selectedPlan === plan) {
      setSelectedPlan(plan);
      onContinue("planTab");

      return;
    }
    setSelectedPlan(plan);
    const product = products?.find((item) => item.name === plan);

    console.log(
      "send event analytic1",
      "productId: ",
      plan,
      "currency: ",
      product?.price?.currency || "USD",
      "value: ",
      (product?.price?.price || 0) / 100
    );
  };

  const onContinue = (place?: string) => {
    console.log(
      "send event analytic2",
      "place: ",
      place ? place : "button",
      "planName: ",
      selectedPlan
    );

    localStorage.setItem("selectedPlan", selectedPlan);

    router.push({ pathname: `${PAGE_LINKS.PAYMENT}`, query: router.query });
  };

  React.useEffect(() => {
    if (user?.subscription !== null) {
      router.push(`${PAGE_LINKS.DASHBOARD}`);
    }

    if (!user?.email) {
      router.back();

      return;
    }

    if (user?.email !== null) {
      return;
    }

    if (router.query?.token) {
      API.auth.byEmailToken(router.query.token as string);
    }
  }, [user?.subscription, user?.email, router.query?.token]);

  // @NOTE: analytics on page rendered
  React.useEffect(() => {
    if (!localStorage.getItem("select_plan_view")) {
      console.log("send event analytic3");
    }

    localStorage.setItem("select_plan_view", "true");

    return () => {
      localStorage.removeItem("select_plan_view");
    };
  }, []);

  React.useEffect(() => {
    API.files.getFiles().then((res) => {
      if (router.query?.file) {
        const chosenFile = res.files.find(
          (item) => item.id === router.query!.file
        );

        setFile(chosenFile);

        return;
      }
      setFile(res.files[res.files.length - 1]);
    });
  }, []);

  // @NOTE: setting pre-select plan for users from remarketing emails
  React.useEffect(() => {
    if (router.query?.fromEmail === "true") {
      setSelectedPlan(PaymentPlanId.MONTHLY_FULL_SECOND_EMAIL);
      return;
    }
  }, [abTests]);

  // @NOTE: generating cover for pdf-documents
  const loadPdfCover = async (): Promise<void> => {
    if (!file || file.internal_type !== "PDF") {
      return;
    }

    setIsImageLoading(true);

    try {
      const fileUrl = await (async () => {
        if (router.query?.file) {
          return router.query.editedFile === "true"
            ? API.files
                .editedFile(router.query.file as string)
                .then((r) => r.url)
            : API.files
                .downloadFile(router.query.file as string)
                .then((r) => r.url);
        }

        return API.files.downloadFile(file.id).then((r) => r.url);
      })();

      const pdfCover = await generatePDFCover({
        pdfFileUrl: fileUrl,
        width: 640,
      });
      setImagePDF(pdfCover);
    } finally {
      setIsImageLoading(false);
    }
  };

  const loadImageCover = async () => {
    if (
      !file ||
      !imagesFormat.includes(file.internal_type) ||
      // @NOTE: this two checks fir filename exists because sometimes OS do not pass file.type correctly
      !imagesFormat.includes(
        file.filename.slice(-3).toUpperCase() as InternalFileType
      ) ||
      !imagesFormat.includes(
        file.filename.slice(-4).toUpperCase() as InternalFileType
      )
    ) {
      return;
    }
    const fileUrl = await (async () => {
      if (router.query?.file) {
        return router.query.editedFile === "true"
          ? API.files.editedFile(router.query.file as string).then((r) => r.url)
          : API.files
              .downloadFile(router.query.file as string)
              .then((r) => r.url);
      }

      return API.files.downloadFile(file.id).then((r) => r.url);
    })();

    setFileLink(fileUrl);
  };

  React.useEffect(() => {
    loadPdfCover();
    loadImageCover();
  }, [loadImageCover, loadPdfCover]);

  const getPlans = (t: (key: string) => string): Plan[] => {
    const getTrialFormattedPrice = (price: number, currency: string) => {
      if (currency === "USD") {
        return `$${price / 100}`;
      }

      if (currency === "GBP") {
        return `£${price / 100}`;
      }

      return `€${price / 100}`;
    };

    const getAnnualFormattedPrice = (price: number, currency: string) => {
      if (price === 19900) {
        return `€${price / 100 / 12}`;
      }
      if (currency === "USD") {
        return `$${price / 100 / 12}`;
      }

      if (currency === "GBP") {
        return `$${price / 100 / 12}`;
      }
      return `€${price / 100 / 12}`;
    };

    const getCurrency = (currency: string) => {
      if (currency === "USD") {
        return "$";
      }

      if (currency === "GBP") {
        return "£";
      }

      return "€";
    };

    return [
      {
        id: products[0]?.name as PaymentPlanId,
        title: t("payment_page.plans.monthly.title"),
        price: getTrialFormattedPrice(
          products[0]?.price!.trial_price!,
          products[0]?.price!.currency
        ),
        fullPrice: getTrialFormattedPrice(
          products[0]?.price?.price,
          products[0]?.price?.currency
        ),
        formattedCurrency: getCurrency(products[0]?.price.currency),
        date: null,
        bullets: [
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.monthly.bullet1")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.monthly.bullet2")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.monthly.bullet3")}</span>,
          },
          {
            imgSrc: cross,
            bullText: (
              <span className="text-[#878787]">
                {t("payment_page.plans.monthly.bullet4")}
              </span>
            ),
          },
          {
            imgSrc: cross,
            bullText: (
              <span className="text-[#878787]">
                {t("payment_page.plans.monthly.bullet5")}
              </span>
            ),
          },
          {
            imgSrc: cross,
            bullText: (
              <span className="text-[#878787]">
                {t("payment_page.plans.monthly.bullet6")}
              </span>
            ),
          },
          {
            imgSrc: cross,
            bullText: (
              <span className="text-[#878787]">
                {t("payment_page.plans.monthly.bullet7")}
              </span>
            ),
          },
          {
            imgSrc: cross,
            bullText: (
              <span className="text-[#878787]">
                {t("payment_page.plans.monthly.bullet8")}
              </span>
            ),
          },
        ],
        //@ts-ignore
        text: t("payment_page.plans.monthly.text", {
          formattedPrice: getTrialFormattedPrice(
            products[0]?.price?.price,
            products[0]?.price?.currency
          ),
        }),
      },
      {
        id: products[1]?.name as PaymentPlanId,
        title: t("payment_page.plans.monthly_full.title"),
        price: getTrialFormattedPrice(
          products[1]?.price?.trial_price!,
          products[1]?.price?.currency
        ),
        fullPrice: getTrialFormattedPrice(
          products[1]?.price?.price,
          products[1]?.price?.currency
        ),
        formattedCurrency: getCurrency(products[1]?.price.currency),
        date: null,
        bullets: [
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet1")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet2")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet3")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet4")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet5")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet6")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet7")}</span>
            ),
          },
          {
            imgSrc: check,
            bullText: (
              <span>{t("payment_page.plans.monthly_full.bullet8")}</span>
            ),
          },
        ],
        // @ts-ignore
        text: t("payment_page.plans.monthly_full.text", {
          formattedPrice: getTrialFormattedPrice(
            products[1]?.price?.price,
            products[1]?.price?.currency
          ),
        }),
      },
      {
        id: products[2]?.name as PaymentPlanId,
        title: t("payment_page.plans.annual.title"),
        price: getAnnualFormattedPrice(
          products[2]?.price?.price,
          products[2]?.price?.currency
        ),
        date: t("payment_page.plans.annual.date"),
        bullets: [
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet1")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet2")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet3")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet4")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet5")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet6")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet7")}</span>,
          },
          {
            imgSrc: check,
            bullText: <span>{t("payment_page.plans.annual.bullet8")}</span>,
          },
        ],
        // @ts-ignore
        text: t("payment_page.plans.annual.text", {
          formattedPrice: getTrialFormattedPrice(
            products[2]?.price?.price,
            products[2]?.price?.currency
          ),
        }),
      },
    ];
  };

  return {
    selectedPlan,
    onSelectPlan,
    onContinue,
    onCommentsFlip,

    imagePDF: imagePDF ? imagePDF : null,
    isImageLoading,
    fileName: file ? file.filename : null,
    fileType: file ? file.internal_type : null,
    fileLink,
    isEditorFlow:
      (router.query?.source === "editor" ||
        router.query?.source === "account") &&
      router.query.convertedFrom === undefined,
    isSecondEmail: router.query?.fromEmail === "true",
    isThirdEmail: router.query?.fromEmail === "true",

    isRemoteConfigLoading,

    getPlans,
    isPlansLoading: products.length === 0,
  };
};
