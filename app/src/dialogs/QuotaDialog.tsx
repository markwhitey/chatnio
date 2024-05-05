import { useDispatch, useSelector } from "react-redux";
import {
  closeDialog,
  dialogSelector,
  refreshQuota,
  setDialog,
} from "@/store/quota.ts";
import {
  openDialog as openSubDialog,
  dialogSelector as subDialogSelector,
} from "@/store/subscription.ts";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import "@/assets/pages/quota.less";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { selectAuthenticated } from "@/store/auth.ts";
import {
  buyLink,
  docsEndpoint,
  useDeeptrain,
} from "@/conf/env.ts";
import { useRedeem } from "@/api/redeem.ts";
import { subscriptionDataSelector } from "@/store/globals.ts";


function QuotaDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const open = useSelector(dialogSelector);
  const auth = useSelector(selectAuthenticated);

  const sub = useSelector(subDialogSelector);
  const subscriptionData = useSelector(subscriptionDataSelector);

  const [redeem, setRedeem] = useState("");

  const dispatch = useDispatch();
  useEffectAsync(async () => {
    if (!auth) return;
    const task = setInterval(() => refreshQuota(dispatch), 5000);
    await refreshQuota(dispatch);

    return () => clearInterval(task);
  }, [auth]);

  return (
    <Dialog
      open={open}
      onOpenChange={(state: boolean) => dispatch(setDialog(state))}
    >
      <DialogContent className={`quota-dialog flex-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("buy.choose")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`dialog-wrapper`}>
              {subscriptionData.length > 0 && (
                <p
                  className={`link translate-y-2 text-center`}
                  onClick={() =>
                    sub ? dispatch(closeDialog()) : dispatch(openSubDialog())
                  }
                >
                  {t("sub.subscription-link")}
                </p>
              )}
              <div className={`buy-interface`}>
                <div className={`interface-item`}>
                  {useDeeptrain ? (
                    <div
                      className={`flex flex-row w-full justify-center items-center mt-2 select-none`}
                    >
                      {t("buy.deeptrain-tip")}
                    </div>
                  ) : (
                    <div className={`flex flex-row w-full`}>
                      <Input
                        className={`redeem-input mr-2 text-center`}
                        placeholder={t("buy.redeem-placeholder")}
                        value={redeem}
                        onChange={(e) => setRedeem(e.target.value)}
                      />
                      <Button
                        loading={true}
                        className={`whitespace-nowrap`}
                        onClick={async () => {
                          if (redeem.trim() === "") return;
                          // eslint-disable-next-line react-hooks/rules-of-hooks
                          const res = await useRedeem(redeem.trim());
                          if (res.status) {
                            toast({
                              title: t("buy.exchange-success"),
                              description: t("buy.exchange-success-prompt", {
                                amount: res.quota,
                              }),
                            });
                            setRedeem("");
                            await refreshQuota(dispatch);
                          } else {
                            toast({
                              title: t("buy.exchange-failed"),
                              description: t("buy.exchange-failed-prompt", {
                                reason: res.error,
                              }),
                            });
                          }
                        }}
                      >
                        {t("buy.redeem")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`tip flex-row items-center justify-center mt-4 mb-4`}
              >
                {buyLink && buyLink.length > 0 && (
                  <Button asChild>
                    <a href={buyLink} target={`_blank`}>
                      <ExternalLink className={`h-4 w-4 mr-2`} />
                      {t("buy.buy-link")}
                    </a>
                  </Button>
                )}
                <Button variant={`outline`} asChild>
                  <a href={docsEndpoint} target={`_blank`}>
                    <ExternalLink className={`h-4 w-4 mr-2`} />
                    {t("buy.learn-more")}
                  </a>
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default QuotaDialog;
